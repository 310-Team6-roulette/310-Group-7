import PageShell from '../components/PageShell'

function TaskListPage() {
  return (
    <PageShell>
      <header className="mb-6 px-1 pt-2 sm:px-2 md:pt-7 lg:pt-9">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Hello, Stranger<span aria-hidden="true">✦</span>
        </h1>
        <p className="mt-1 text-base">
          Welcome to your Task lists
        </p>
      </header>

      <div className="rounded-[1.75rem] bg-brand-blue p-4 sm:rounded-[2.5rem] sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Your tasks</h2>
        <p className="text-sm">No tasks to do — add a task to get started.</p>
      </div>
    </PageShell>
  )
}

export default TaskListPage