import { useState } from 'react'
import beaver from '../assets/beaver.png'
import beaverArms from '../assets/beaverArms.png'
import grassDouble from '../assets/grassDouble.svg'
import PageShell, {
  BEAVER_POSITION,
  PRIMARY_PILL_CLASSES,
} from '../components/PageShell'

const TASK_COLUMNS = [
  { id: 'todo', title: 'To Do', tone: 'bg-brand-blue' },
  { id: 'in_progress', title: 'In Progress', tone: 'bg-brand-pink' },
  { id: 'completed', title: 'Completed', tone: 'bg-brand-green' },
  { id: 'on_hold', title: 'On Hold', tone: 'bg-brand-yellow' },
]

// Create an empty array for every task column.
// Tasks will be loaded from Supabase.
const EMPTY_TASKS = Object.fromEntries(
  TASK_COLUMNS.map((column) => [column.id, []]),
)

function TaskListPage() {
  const [tasks] = useState(EMPTY_TASKS)

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-4 px-1 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-2 md:pt-7 lg:pt-9">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hello, Stranger<span aria-hidden="true">✦</span>
          </h1>
          <p className="mt-1 text-base">
            Welcome to your task dashboard
          </p>
        </div>

        <button
          type="button"
          className={`w-full sm:w-auto ${PRIMARY_PILL_CLASSES}`}
        >
          + Add task
        </button>
      </header>

      <img
        src={beaver}
        alt=""
        aria-hidden="true"
        className={`${BEAVER_POSITION} z-0`}
      />

      <div className="relative z-10 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TASK_COLUMNS.map((column) => (
          <section
            key={column.id}
            className={`${column.tone} flex min-h-56 flex-col rounded-[1.35rem] p-4`}
          >
            <header className="mb-7 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-base font-medium">
                <span className="size-2 rounded-full bg-white" />
                {column.title}
              </h2>

              <span className="min-w-8 rounded-full bg-white/70 px-2 py-1 text-center text-xs">
                {tasks[column.id].length}
              </span>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {tasks[column.id].map((task) => (
                <article
                  key={task.id}
                  className="rounded-2xl bg-white p-4 shadow-sm"
                >
                  <h3 className="font-semibold">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="mt-2 text-sm text-brand-black/70">
                      {task.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <img
        src={beaverArms}
        alt=""
        aria-hidden="true"
        className={`${BEAVER_POSITION} z-20`}
      />

      <img
        src={grassDouble}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 right-[25%] z-20 hidden w-44 translate-x-1/2 opacity-80 xl:block"
      />
    </PageShell>
  )
}

export default TaskListPage
