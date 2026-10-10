
import { useState } from 'react'
import beaver from '../assets/beaver.png'
import beaverArms from '../assets/beaverArms.png'
import grassDouble from '../assets/grassDouble.svg'
import PageShell, {
  BEAVER_POSITION,
  PRIMARY_PILL_CLASSES,
} from '../components/PageShell'
import TaskModal from '../components/TaskModal'

// Define the task columns, including their unique IDs,
// display names, and background colours.
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
  // Store tasks grouped by status and track whether the
  // task creation modal is currently visible.
  const [tasks, setTasks] = useState(EMPTY_TASKS)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Handle task creation using the data submitted from TaskModal.
  // Validate the selected status, assign a unique ID, and add the
  // new task to its corresponding column before closing the modal.
  function handleAddTask(task) {
    const status = TASK_COLUMNS.some(
      (column) => column.id === task.status,
    )
      // Default to the "To Do" column if an invalid status is provided.
      ? task.status
      : 'todo'

    const newTask = {
      ...task,
      id: crypto.randomUUID(),
      status,
    }

    // Update the task state while preserving existing tasks.
    setTasks((prev) => ({
      ...prev,
      [status]: [...prev[status], newTask],
    }))

    setIsModalOpen(false)
  }

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
          onClick={() => setIsModalOpen(true)}
          className={`w-full transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-black sm:w-auto ${PRIMARY_PILL_CLASSES}`}
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
      {/* Render the task board. Each column displays its title, task count, and associated tasks. */}
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

            {/* Display the tasks in the current column. */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {/* Render each task as a card within its current status column. */}
              {tasks[column.id].map((task) => (
                <article
                  key={task.id}
                  className="rounded-2xl bg-white p-4 shadow-sm"
                >
                  <h3 className="font-semibold">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-brand-black/70">
                      {task.description}
                    </p>
                  )}

                  {task.dueDate && (
                    <p className="mt-3 text-xs text-brand-black/60">
                      Due {task.dueDate}
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

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </PageShell>
  )
}

export default TaskListPage
