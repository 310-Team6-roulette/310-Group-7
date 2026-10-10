function TaskCard({
  title,
  description,
  dueDate,
  onDelete,
}) {
  return (
    <article className="rounded-2xl bg-white px-4 py-3.5 text-brand-black shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="break-words text-sm font-bold leading-tight">
          {title}
        </h3>

        {onDelete && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            aria-label={`Delete task: ${title}`}
            title="Delete task"
            className="relative z-10 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-brand-black/40 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-red-500"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-4"
              aria-hidden="true"
            >
              <path
                d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

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
