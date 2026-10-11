import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import CalendarEntry from './CalendarEntry'

function CalendarDay({ id, title, events, isCurrent}) {
  const { setNodeRef } = useDroppable({ id })
  const sectStyle = {
    border: '1px solid #d6d6d6'
  }

  return (
    <section
      style={sectStyle}
      className={`${isCurrent ? 'bg-[#e6e6e6]' : 'bg-brand-bg'} flex flex-col px-1`}
    >
      <header className="mb-1 flex items-center justify-between px-1">
        <h2 className={`flex items-center gap-2 font-medium text-sm`}>
          {title}
        </h2>
      </header>

      <SortableContext items={events.map((application) => application.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="min-h-full flex-1 space-y-3 overflow-y-auto">
          {events.map((application) => (
            <CalendarEntry
              key={application.id}
              application={application}
            />
          ))}
        </div>
      </SortableContext>
    </section>
  )
}

export default CalendarDay
