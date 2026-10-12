function CalendarEntry({
  application
}) {
  const status = (application.status.charAt(0).toUpperCase() + application.status.slice(1)).replace("_", " ");
  const cols = new Map([
    ['to_apply', 'border-sky-300'],
    ['applied', 'border-red-300'],
    ['interview', 'border-green-300'],
    ['offer', 'border-amber-300']
  ])

  return (
    <div className={`rounded-[0.5rem] bg-white px-4 py-1 text-brand-black border-1 ${cols.get(application.status)}`}>
      <p className="truncate text-xs font-medium">{status} - {application.company}</p>
    </div>
  )
}

export default CalendarEntry
