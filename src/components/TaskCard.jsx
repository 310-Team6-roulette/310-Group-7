function TaskCard({ title, description, dueDate }) {
  return (
    <article className="rounded-2xl bg-white px-4 py-3.5 text-brand-black shadow-sm transition-shadow hover:shadow-md">
      <h3 className="break-words text-sm font-bold leading-tight">
        {title}
      </h3>

      {description && (
        <p className="mt-2 whitespace-pre-wrap break-words text-xs text-brand-black/65">
          {description}
        </p>
      )}

      {dueDate && (
        <p className="mt-3 text-xs text-brand-black/55">
          Due {dueDate}
        </p>
      )}
    </article>
  )
}

export default TaskCard
