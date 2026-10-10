import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const TIME_ZONE = 'Pacific/Auckland'
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

function requiredEnvironmentValue(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function dateKeyInNewZealand(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00Z`)
  return new Date(date.getTime() + days * DAY_IN_MILLISECONDS).toISOString().slice(0, 10)
}

function describeDeadline(daysUntilDue) {
  if (daysUntilDue === 0) return 'due today'
  if (daysUntilDue === 1) return 'due tomorrow'
  return `due in ${daysUntilDue} days`
}

export default async () => {
  const supabaseUrl = requiredEnvironmentValue('SUPABASE_URL')
  const supabaseSecretKey = requiredEnvironmentValue('SUPABASE_SECRET_KEY')
  const vapidPublicKey = requiredEnvironmentValue('VAPID_PUBLIC_KEY')
  const vapidPrivateKey = requiredEnvironmentValue('VAPID_PRIVATE_KEY')
  const vapidSubject = requiredEnvironmentValue('VAPID_SUBJECT')

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const today = dateKeyInNewZealand()
  const finalReminderDate = addDays(today, 2)

  const { data: applications, error: applicationError } = await supabase
    .from('applications')
    .select('id,user_id,company_name,role,due_date,status')
    .gte('due_date', today)
    .lte('due_date', finalReminderDate)
    .not('status', 'in', '(offer,rejected)')

  if (applicationError) throw applicationError
  if (applications.length === 0) return Response.json({ delivered: 0, removed: 0 })

  const userIds = [...new Set(applications.map((application) => application.user_id))]
  const applicationIds = applications.map((application) => application.id)
  const { data: subscriptions, error: subscriptionError } = await supabase
    .from('push_subscriptions')
    .select('id,user_id,endpoint,p256dh,auth')
    .in('user_id', userIds)

  if (subscriptionError) throw subscriptionError
  if (subscriptions.length === 0) return Response.json({ delivered: 0, removed: 0 })

  const { data: deliveries, error: deliveryError } = await supabase
    .from('push_notification_deliveries')
    .select('application_id,push_subscription_id')
    .eq('reminder_date', today)
    .in('application_id', applicationIds)

  if (deliveryError) throw deliveryError

  const deliveredToday = new Set(
    deliveries.map(
      (delivery) => `${delivery.application_id}:${delivery.push_subscription_id}`,
    ),
  )
  const subscriptionsByUser = new Map()
  subscriptions.forEach((subscription) => {
    const userSubscriptions = subscriptionsByUser.get(subscription.user_id) ?? []
    userSubscriptions.push(subscription)
    subscriptionsByUser.set(subscription.user_id, userSubscriptions)
  })
  const successfulDeliveries = []
  const expiredSubscriptionIds = []

  for (const application of applications) {
    const daysUntilDue = Math.round(
      (Date.parse(application.due_date) - Date.parse(today)) / DAY_IN_MILLISECONDS,
    )
    const userSubscriptions = subscriptionsByUser.get(application.user_id) ?? []

    for (const subscription of userSubscriptions) {
      const deliveryKey = `${application.id}:${subscription.id}`
      if (deliveredToday.has(deliveryKey)) continue

      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify({
            title: `${application.company_name} application ${describeDeadline(daysUntilDue)}`,
            body: application.role,
            tag: `application-deadline-${application.id}`,
            url: '/',
          }),
          { TTL: 24 * 60 * 60, urgency: 'high' },
        )

        successfulDeliveries.push({
          application_id: application.id,
          push_subscription_id: subscription.id,
          reminder_date: today,
        })
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          expiredSubscriptionIds.push(subscription.id)
        } else {
          console.error('Failed to send deadline notification', error)
        }
      }
    }
  }

  if (successfulDeliveries.length > 0) {
    const { error } = await supabase
      .from('push_notification_deliveries')
      .upsert(successfulDeliveries, {
        onConflict: 'application_id,push_subscription_id,reminder_date',
        ignoreDuplicates: true,
      })
    if (error) throw error
  }

  if (expiredSubscriptionIds.length > 0) {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .in('id', [...new Set(expiredSubscriptionIds)])
    if (error) throw error
  }

  return Response.json({
    delivered: successfulDeliveries.length,
    removed: new Set(expiredSubscriptionIds).size,
  })
}

export const config = {
  schedule: '0 20 * * *',
}
