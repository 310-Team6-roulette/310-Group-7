import { supabase } from './supabaseClient'

function decodePublicKey(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const bytes = atob(base64)

  return Uint8Array.from(bytes, (character) => character.charCodeAt(0))
}

export function supportsPushNotifications() {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export async function enablePushNotifications(userId) {
  if (!supportsPushNotifications()) return { status: 'unsupported' }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { status: permission }

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!publicKey) return { status: 'local-only' }

  const registration = await navigator.serviceWorker.register('/notification-service-worker.js')
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodePublicKey(publicKey),
    })
  }

  const savedSubscription = subscription.toJSON()
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: savedSubscription.endpoint,
      p256dh: savedSubscription.keys?.p256dh,
      auth: savedSubscription.keys?.auth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  )

  if (error) throw error
  return { status: 'subscribed' }
}
