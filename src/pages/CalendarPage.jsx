import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import confetti from 'canvas-confetti'
import beaver from '../assets/beaver.png'
import beaverArms from '../assets/beaverArms.png'
import grassDouble from '../assets/grassDouble.svg'
import ApplicationCard from '../components/ApplicationCard'
import ApplicationModal from '../components/ApplicationModal'
import PageShell, { BEAVER_POSITION, PRIMARY_PILL_CLASSES } from '../components/PageShell'
import StatusColumn from '../components/StatusColumn'
import {
  deleteApplication,
  fetchApplications,
  insertApplication,
  updateApplicationPositions,
} from '../lib/applications'
import useAuth from '../context/useAuth'
import { COLUMNS, groupByStatus } from './dashboardData'
import CalendarDay from '../components/CalendarDay'

const NEW_APPLICATION_COLUMN = COLUMNS[0].id
const OFFER_COLUMN = 'offer'
// Mirrors brand-yellow/blue/pink/green in src/styles/preset.css — canvas-confetti
// needs literal color strings, so these can't reference the CSS custom
// properties directly. Keep in sync if the palette changes.
const CONFETTI_COLORS = ['#F5E0AE', '#A6C2D2', '#D9BFB1', '#B8D2C7']
const EMPTY_ITEMS = COLUMNS.reduce((acc, column) => ({ ...acc, [column.id]: [] }), {})

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function findContainer(items, id) {
  if (id in items) return id
  return Object.keys(items).find((key) => items[key].some((item) => item.id === id))
}

function CalendarPage() {
  const { user } = useAuth()
  const [items, setItems] = useState(EMPTY_ITEMS)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchApplications()
      .then((applications) => {
        if (!cancelled) setItems(groupByStatus(applications, COLUMNS))
      })
      .catch((error) => {
        console.error('Failed to load applications', error)
        if (!cancelled) setLoadError(error)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const getDayIndex = (index, days) => index - days * Math.floor(index/days) + 1;
  const getRows = (year, month) => Math.ceil(getFirstDayOfMonth(year, month) + getDaysInMonth(year, month));

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);
  const rows = getRows(year, month);

  const prevMonth = month === 0 ? 11 : month - 1;

  const daysInPrevMonth = getDaysInMonth(year, prevMonth);
  const daysInNextMonth = 35 - (daysInMonth + firstDayIndex);

  const borderStyle = {
    border: '0.5px solid #b9b9b9',
  }
  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-4 px-1 pt-2 sm:flex-row sm:items-start sm:justify-between sm:px-2 md:pt-7 lg:pt-9">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hello, Stranger<span aria-hidden="true">✦</span>
          </h1>
          <p className="mt-1 text-base">Welcome to your calendar</p>
          {isLoading && <p className="mt-1 text-xs text-brand-black/60">Loading your calendar…</p>}
          {loadError && (
            <p className="mt-1 text-xs text-red-600">Couldn't load calendar. Try refreshing.</p>
          )}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2>{MONTHS[month]} {year}</h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <button onClick={handlePrevMonth}>&lt;</button>
            <button onClick={handleNextMonth}>&gt;</button>
          </div>
        </div>
      </header>

      <img
        src={beaver}
        alt=""
        aria-hidden="true"
        className={`${BEAVER_POSITION} z-0`}
      />

      <div style={borderStyle} className="relative z-10 grid flex-1 grid-cols-7 grid-rows-1 gap-0">
        {WEEKDAYS.map((day) => (
          <div key={day} className="bg-brand-bg">
            <p style = {{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }} className='font-semibold'>{day}</p>
          </div>
        ))}
      </div>

      <div style={borderStyle} className="relative z-10 grid flex-1 grid-cols-7 grid-rows-${rows} gap-0">
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <CalendarDay
            id={(daysInPrevMonth - (firstDayIndex - index) + 1).toString()}
            title={(daysInPrevMonth - (firstDayIndex - index) + 1).toString()}
            events={items['interview']}
          />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => (
          <CalendarDay
            id={getDayIndex(index, daysInMonth).toString()}
            title={getDayIndex(index, daysInMonth).toString()}
            events={items['interview']}
          />
        ))}

        {Array.from({ length: daysInNextMonth }).map((_, index) => (
          <CalendarDay
            id={(index + 1).toString()}
            title={(index + 1).toString()}
            events={items['interview']}
          />
        ))}
      </div>

      <img
        src={beaverArms}
        alt=""
        aria-hidden="true"
        className={`${BEAVER_POSITION} z-20`}
      />
    </PageShell>
  )
}

export default CalendarPage
