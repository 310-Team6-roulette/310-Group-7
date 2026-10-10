import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

import beaver from '../assets/beaver.png'
import beaverArms from '../assets/beaverArms.png'
import grassDouble from '../assets/grassDouble.svg'

import PageShell, {
  BEAVER_POSITION,
  PRIMARY_PILL_CLASSES,
} from '../components/PageShell'
import TaskModal from '../components/TaskModal'
import TaskColumn from '../components/TaskColumn'
import TaskCard from '../components/TaskCard'

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

// Find which column contains a particular task.
// The ID may also refer to a column itself.
function findContainer(tasks, id) {
  if (Object.hasOwn(tasks, id)) return id

  return Object.keys(tasks).find((columnId) =>
    tasks[columnId].some((task) => task.id === id),
  )
}

function TaskListPage() {
  const [tasks, setTasks] = useState(EMPTY_TASKS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTask, setActiveTask] = useState(null)

  // Match the Dashboard's mouse and keyboard sensors.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

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

  function handleDragStart(event) {
    const { active } = event

    const container = findContainer(tasks, active.id)

    if (!container) return

    const draggedTask = tasks[container].find(
      (task) => task.id === active.id,
    )

    setActiveTask(draggedTask ?? null)
  }

  function handleDragEnd(event) {
    const { active, over } = event

    setActiveTask(null)

    // If dropped outside all columns, do nothing.
    if (!over) return

    setTasks((prev) => {
      const sourceColumn = findContainer(prev, active.id)
      const destinationColumn = findContainer(prev, over.id)

      if (!sourceColumn || !destinationColumn) {
        return prev
      }

      const sourceTasks = prev[sourceColumn]
      const destinationTasks = prev[destinationColumn]

      const sourceIndex = sourceTasks.findIndex(
        (task) => task.id === active.id,
      )

      if (sourceIndex === -1) return prev

      const draggedTask = sourceTasks[sourceIndex]

      // Case 1: Reordering tasks within the same column.
      if (sourceColumn === destinationColumn) {
        const destinationIndex = destinationTasks.findIndex(
          (task) => task.id === over.id,
        )

        // Dropping onto the column itself leaves order unchanged.
        if (destinationIndex === -1) return prev

        if (sourceIndex === destinationIndex) return prev

        return {
          ...prev,
          [sourceColumn]: arrayMove(
            sourceTasks,
            sourceIndex,
            destinationIndex,
          ),
        }
      }

      // Case 2: Moving a task into another column.
      // Update its status to match the destination.
      const updatedTask = {
        ...draggedTask,
        status: destinationColumn,
      }

      const remainingSourceTasks = sourceTasks.filter(
        (task) => task.id !== active.id,
      )

      const destinationIndex = destinationTasks.findIndex(
        (task) => task.id === over.id,
      )

      // Append to the bottom if dropped onto the empty column area.
      const insertIndex =
        destinationIndex === -1
          ? destinationTasks.length
          : destinationIndex

      const updatedDestinationTasks = [...destinationTasks]

      updatedDestinationTasks.splice(
        insertIndex,
        0,
        updatedTask,
      )

      return {
        ...prev,
        [sourceColumn]: remainingSourceTasks,
        [destinationColumn]: updatedDestinationTasks,
      }
    })
  }

  function handleDragCancel() {
    setActiveTask(null)
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="relative z-10 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TASK_COLUMNS.map((column) => (
            <TaskColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tone={column.tone}
              tasks={tasks[column.id]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 cursor-grabbing">
              <TaskCard {...activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
