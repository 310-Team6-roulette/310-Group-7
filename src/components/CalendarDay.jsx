import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableApplicationCard from './SortableApplicationCard'

function CalendarDay({ id, title, events }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <section className={`bg-brand-blue flex flex-col p-4`}>
      <header className="mb-7 flex items-center justify-between px-1">
        <h2 className={`flex items-center gap-2 font-medium text-base`}>
          <span className="size-2 rounded-full bg-white" />
          {title}
        </h2>
      </header>

      <SortableContext items={events.map((application) => application.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="min-h-full flex-1 space-y-3 overflow-y-auto">
          {events.map((application) => (
            <SortableApplicationCard
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
