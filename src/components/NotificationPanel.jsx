import { useEffect, useState } from 'react'
import { describeDeadline } from '../lib/notifications'

function getPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

function getLocalDateKey() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function NotificationPanel({ reminders, userId, className = '' }) {
  const [permission, setPermission] = useState(getPermission)
  const [permissionError, setPermissionError] = useState('')

  useEffect(() => {
    if (permission !== 'granted' || reminders.length === 0) return

    const storageKey = `pipeline-deadline-notifications:${userId ?? 'unknown-user'}`
    const todayKey = getLocalDateKey()
    let sentNotifications = {}

    try {
      sentNotifications = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
    } catch {
      sentNotifications = {}
    }

    let changed = false

    reminders.forEach((application) => {
      const reminderKey = `${application.id}:${application.dueDate}`
      if (sentNotifications[reminderKey] === todayKey) return

      try {
        new Notification(`${application.company} application ${describeDeadline(application.daysUntilDue)}`, {
          body: application.role,
          tag: `application-deadline-${application.id}`,
        })
        sentNotifications[reminderKey] = todayKey
        changed = true
      } catch (error) {
        console.error('Desktop notification could not be shown', error)
      }
    })

    if (changed) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(sentNotifications))
      } catch (error) {
        console.error('Desktop notification history could not be saved', error)
      }
    }
  }, [permission, reminders, userId])

  async function requestPermission() {
    setPermissionError('')

    try {
      const nextPermission = await Notification.requestPermission()
      setPermission(nextPermission)
    } catch {
      setPermissionError('Desktop notification permission could not be requested.')
    }
  }

  if (reminders.length === 0) return null

  return (
    <section
      aria-labelledby="deadline-reminders-title"
      className={`relative z-10 rounded-3xl bg-brand-yellow p-4 shadow-sm sm:p-5 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="deadline-reminders-title" className="text-lg font-bold">
            Upcoming deadlines
          </h2>
          <ul className="mt-1 space-y-1 text-sm">
            {reminders.map((application) => (
              <li key={application.id}>
                <strong>{application.company}</strong> — {application.role}{' '}
                {describeDeadline(application.daysUntilDue)}
              </li>
            ))}
          </ul>
          {permission === 'denied' && (
            <p className="mt-2 text-xs">Desktop alerts are blocked in your browser settings.</p>
          )}
          {permission === 'unsupported' && (
            <p className="mt-2 text-xs">This browser does not support desktop alerts.</p>
          )}
          {permissionError && <p className="mt-2 text-xs text-red-700">{permissionError}</p>}
        </div>

        {permission === 'default' && (
          <button
            type="button"
            onClick={requestPermission}
            className="shrink-0 rounded-full bg-brand-black px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-black"
          >
            Enable desktop alerts
          </button>
        )}
      </div>
    </section>
  )
}

export default NotificationPanel
