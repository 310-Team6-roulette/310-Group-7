import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CalendarPage from './CalendarPage'
import { fetchApplications } from '../../lib/applications'

const taskListMock = vi.hoisted(() => ({
  tasks: {
    todo: [],
    in_progress: [],
    completed: [],
  },
}))

vi.mock('../../lib/applications', () => ({
  fetchApplications: vi.fn(),
}))

vi.mock('../../hooks/useTaskList', () => ({
  default: () => taskListMock,
}))

vi.mock('../../components/layout/PageShell', () => ({
  default: ({ children }) => <main>{children}</main>,
  BEAVER_POSITION: 'beaver-position',
}))

vi.mock('../../components/calendar/CalendarDay', () => ({
  default: ({ title, events, tasks, isCurrent }) => (
    <section aria-label={`Day ${title}`} data-current={isCurrent || undefined}>
      <h2>{title}</h2>
      {events.map((application) => (
        <p key={application.id}>
          Application: {application.company}
        </p>
      ))}
      {tasks.map((task) => (
        <p key={task.id}>Task: {task.title}</p>
      ))}
    </section>
  ),
}))

const HOBBYCON = {
  id: 'application-1',
  company: 'Hobbycon',
  location: 'Auckland',
  role: 'Frontend Developer',
  dueDate: '2026-01-10',
  status: 'to_apply',
}

const ARCANE = {
  id: 'application-2',
  company: 'Arcane Development',
  location: 'Auckland',
  role: 'Software Engineer',
  dueDate: '2026-02-03',
  status: 'applied',
}

const TODO = {
  id: 'task-1',
  title: 'Prepare portfolio',
  dueDate: '2026-01-10',
  status: 'todo',
}

const IN_PROGRESS = {
  id: 'task-2',
  title: 'Submit references',
  dueDate: '2026-01-20',
  status: 'in_progress',
}

const COMPLETED = {
  id: 'task-3',
  title: 'Completed task',
  dueDate: '2026-01-10',
  status: 'completed',
}

const LOADING = /Loading your calendar/i

function deferred() {
  let resolve
  const promise = new Promise((res) => {
    resolve = res
  })
  return { promise, resolve }
}

async function renderLoadedCalendar() {
  const user = userEvent.setup()
  render(<CalendarPage />)
  await waitFor(() =>
    expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
  )
  return user
}

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-01-15T09:00:00Z'))
    taskListMock.tasks = {
      todo: [TODO],
      in_progress: [IN_PROGRESS],
      completed: [COMPLETED],
    }
    fetchApplications.mockResolvedValue([HOBBYCON, ARCANE])
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('loading', () => {
    it('shows a loading state until applications have been fetched', async () => {
      const pending = deferred()
      fetchApplications.mockReturnValueOnce(pending.promise)

      render(<CalendarPage />)

      expect(screen.getByText(LOADING)).toBeInTheDocument()

      pending.resolve([HOBBYCON])

      expect(await screen.findByText('Application: Hobbycon')).toBeInTheDocument()
      expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
    })

    it('fetches applications exactly once on mount', async () => {
      await renderLoadedCalendar()

      expect(fetchApplications).toHaveBeenCalledTimes(1)
    })

    it('stops loading and shows an error when fetching fails', async () => {
      fetchApplications.mockRejectedValueOnce(new Error('Network down'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<CalendarPage />)

      expect(
        await screen.findByText(/couldn't load calendar/i)
      ).toBeInTheDocument()
      expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
    })
  })

  describe('calendar entries', () => {
    it('renders applications and active tasks on their due dates', async () => {
      await renderLoadedCalendar()

      const january10 = within(
        screen.getByRole('region', { name: 'Day 10' })
      )
      const january20 = within(
        screen.getByRole('region', { name: 'Day 20' })
      )

      expect(january10.getByText('Application: Hobbycon')).toBeInTheDocument()
      expect(january10.getByText('Task: Prepare portfolio')).toBeInTheDocument()
      expect(january20.getByText('Task: Submit references')).toBeInTheDocument()
      expect(screen.queryByText('Task: Completed task')).not.toBeInTheDocument()
      expect(screen.queryByText('Application: Arcane Development')).not.toBeInTheDocument()
    })

    it('renders an empty calendar when there are no applications or tasks', async () => {
      fetchApplications.mockResolvedValueOnce([])
      taskListMock.tasks = { todo: [], in_progress: [], completed: [] }

      await renderLoadedCalendar()

      expect(screen.queryByText(/^Application:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/^Task:/)).not.toBeInTheDocument()
    })
  })

  describe('month navigation', () => {
    it('shows the current month and moves to the next and previous months', async () => {
      const user = await renderLoadedCalendar()

      expect(screen.getByRole('heading', { name: 'January 2026' })).toBeInTheDocument()

      await user.click(
        screen.getByRole('button', { name: 'Show February 2026' })
      )
      expect(screen.getByRole('heading', { name: 'February 2026' })).toBeInTheDocument()
      expect(screen.getByText('Application: Arcane Development')).toBeInTheDocument()

      await user.click(
        screen.getByRole('button', { name: 'Show January 2026' })
      )
      expect(screen.getByRole('heading', { name: 'January 2026' })).toBeInTheDocument()
      expect(screen.getByText('Application: Hobbycon')).toBeInTheDocument()
    })

    it('wraps navigation across the year boundary', async () => {
      const user = await renderLoadedCalendar()

      await user.click(
        screen.getByRole('button', { name: 'Show December 2025' })
      )
      expect(screen.getByRole('heading', { name: 'December 2025' })).toBeInTheDocument()

      await user.click(
        screen.getByRole('button', { name: 'Show January 2026' })
      )
      expect(screen.getByRole('heading', { name: 'January 2026' })).toBeInTheDocument()
    })
  })
})
