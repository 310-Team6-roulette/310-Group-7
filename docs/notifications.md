# Notifications and deadline reminders

Pipeline warns users when an unfinished application is due soon. The reminder
logic works from the due date already stored on each application, so no database
change is required.

## What counts as upcoming

An application appears in the reminder panel when its due date is today,
tomorrow, or two days away. Past deadlines and applications in Offer or Rejected
are excluded. Missing or invalid due dates are ignored.

Dates are compared as local calendar days rather than exact 24-hour periods.
This avoids reminders shifting by a day because of time zones or daylight-saving
changes.

## In-app reminders

Upcoming deadlines appear in a yellow panel above the dashboard board. The panel
is hidden when there is nothing due soon. Each reminder shows the company, role,
and a short description such as "due today" or "due tomorrow".

## Desktop alerts

The reminder panel offers desktop alerts when the browser supports them. The
browser permission prompt is only opened after the user selects the enable
button. If permission is denied, the in-app reminders continue to work.

Once permission is granted, Pipeline shows at most one desktop alert per
application and due date on each local calendar day. This history is kept in the
browser and separated by signed-in user.

Desktop alerts are checked while Pipeline is open. True background push alerts
would require a service worker, the Push API, and a scheduled backend process.

## Manual verification

Create unfinished applications due today, tomorrow, in two days, and in three
days. Confirm only the first three appear. Move one to Offer and confirm it is
removed. Enable desktop alerts and confirm alerts appear once, then refresh and
confirm they are not repeated on the same day.

Also verify that denying permission leaves the in-app panel working, and that an
application without a due date does not appear.

## Future work

Add automated tests around date boundaries, configurable reminder windows, and
background push notifications when the application is closed.
