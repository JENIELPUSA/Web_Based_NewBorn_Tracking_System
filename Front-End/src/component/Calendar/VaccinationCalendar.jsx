import React, { useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { motion } from 'framer-motion';
import '../Calendar/VaccinationCalendar.css';

// Helper function to format dates consistently
const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const VaccinationCalendar = ({ selectedChildId, vaccinationRecords = [] }) => {
  // Filtered records based on child
  const markedDates = useMemo(() => {
    if (!selectedChildId || !vaccinationRecords?.length) return vaccinationRecords;
    return vaccinationRecords.filter(record => record.newborn._id === selectedChildId);
  }, [selectedChildId, vaccinationRecords]);

  const markedDateStrings = useMemo(() => {
    return markedDates.map(record => formatDate(new Date(record.dateGiven)));
  }, [markedDates]);

  // Find the next upcoming vaccination (per child if selected)
  const nextScheduleRecord = useMemo(() => {
    const now = new Date();
    const futureRecords = markedDates
      .filter(record => new Date(record.dateGiven) > now)
      .sort((a, b) => new Date(a.dateGiven) - new Date(b.dateGiven));

    return futureRecords.length > 0 ? futureRecords[0] : null;
  }, [markedDates]);

  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const dateString = formatDate(date);
    const recordsForDate = markedDates.filter(
      (record) => formatDate(new Date(record.dateGiven)) === dateString
    );

    const isNextSchedule = nextScheduleRecord && formatDate(new Date(nextScheduleRecord.dateGiven)) === dateString;

    return (
      <div className="relative w-full h-full flex items-end justify-center">
        {recordsForDate.map((record, index) => (
          <motion.div
            key={`${record._id}-${index}`}
            className="vaccinated-dot w-3 h-3 bg-gradient-to-br from-red-400 to-red-600 rounded-full cursor-pointer shadow-sm mb-1"
            data-tooltip-id={`vaccine-tooltip-${record._id}`}
            data-tooltip-content={`Vaccine: ${record.vaccine.name}\nNewborn: ${record.newborn.name}`}
            data-tooltip-place="top"
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
        {isNextSchedule && (
          <motion.div
            className="next-schedule-dot w-4 h-4 bg-blue-500 rounded-full border-2 border-white absolute -top-1 -right-1 shadow-lg"
            data-tooltip-id={`next-schedule-tooltip-${dateString}`}
            data-tooltip-content={`📅 Next Schedule\n${nextScheduleRecord.vaccine.name} for ${nextScheduleRecord.newborn.name}`}
            data-tooltip-place="top"
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl w-full max-w-6xl mx-auto border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
          Vaccination Calendar
        </span>
      </h2>

      <div className="calendar-container w-full h-full">
        <div className="calendar-wrapper w-full h-full min-h-[550px] bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl shadow-inner">
          <Calendar
            tileContent={getTileContent}
            className="rounded-xl border-none w-full h-full"
            tileClassName={({ date, view }) =>
              view === 'month' && markedDateStrings.includes(formatDate(date))
                ? 'has-vaccination'
                : null
            }
            navigationLabel={({ date, label, locale }) => (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg font-semibold text-gray-800">
                  {new Date(date).toLocaleDateString(locale, { month: 'long' })}
                </span>
                <span className="text-lg font-semibold text-gray-600">
                  {new Date(date).getFullYear()}
                </span>
              </div>
            )}
          />
        </div>
      </div>

      {/* Tooltips */}
      {markedDates.map((record) => (
        <ReactTooltip
          key={`tooltip-${record._id}`}
          id={`vaccine-tooltip-${record._id}`}
          className="!bg-white !text-gray-800 !shadow-xl !border !border-gray-200 !rounded-lg !p-3 !max-w-xs !backdrop-blur-sm"
          float={true}
          positionStrategy="fixed"
        />
      ))}

      {nextScheduleRecord && (
        <ReactTooltip
          id={`next-schedule-tooltip-${formatDate(new Date(nextScheduleRecord.dateGiven))}`}
          className="!bg-blue-100 !text-blue-900 !shadow-xl !border !border-blue-300 !rounded-lg !p-3 !max-w-xs !backdrop-blur-sm"
          float={true}
          positionStrategy="fixed"
        />
      )}

      <style jsx global>{`
        .react-calendar {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          border: none;
          background: transparent;
          font-size: 1rem;
          padding: 0.5rem;
        }

        .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: repeat(6, 1fr);
          min-height: 600px;
        }

        .react-calendar__tile {
          min-height: 90px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          position: relative;
          border-radius: 0.75rem;
          transition: all 0.2s ease;
          background: white;
          border: 1px solid #edf2f7;
        }

        .react-calendar__tile abbr {
          margin-top: 0.25rem;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .has-vaccination {
          background: #fef2f2;
          border-color: #fecaca;
        }

        @media (max-width: 768px) {
          .react-calendar {
            font-size: 0.875rem;
          }
          .react-calendar__tile {
            min-height: 75px;
          }
        }

        @media (max-width: 480px) {
          .react-calendar {
            font-size: 0.75rem;
          }
          .react-calendar__tile {
            min-height: 60px;
          }
        }
      `}</style>
    </div>
  );
};

VaccinationCalendar.defaultProps = {
  selectedChildId: '',
  vaccinationRecords: [
    {              
      _id: '1',
      vaccine: { name: 'Vaccine A' },
      newborn: { _id: 'child1', name: 'Newborn 1' },
      dateGiven: new Date().toISOString(),
    },
    {
      _id: '2',
      vaccine: { name: 'Vaccine B' },
      newborn: { _id: 'child2', name: 'Newborn 2' },
      dateGiven: new Date(Date.now() + 86400000 * 2).toISOString(),
    },
    {
      _id: '3',
      vaccine: { name: 'Vaccine C' },
      newborn: { _id: 'child3', name: 'Newborn 3' },
      dateGiven: new Date(Date.now() + 86400000 * 3).toISOString(),
    },
    {
      _id: '4',
      vaccine: { name: 'Vaccine D' },
      newborn: { _id: 'child1', name: 'Newborn 1' },
      dateGiven: new Date(Date.now() + 86400000 * 4).toISOString(),
    },
    {
      _id: '5',
      vaccine: { name: 'Vaccine A' },
      newborn: { _id: 'child2', name: 'Newborn 2' },
      dateGiven: new Date(Date.now() + 86400000 * 5).toISOString(),
    },
    {
      _id: '6',
      vaccine: { name: 'Vaccine B' },
      newborn: { _id: 'child3', name: 'Newborn 3' },
      dateGiven: new Date(Date.now() + 86400000 * 6).toISOString(),
    },
    {
      _id: '7',
      vaccine: { name: 'Vaccine C' },
      newborn: { _id: 'child1', name: 'Newborn 1' },
      dateGiven: new Date(Date.now() + 86400000 * 7).toISOString(),
    },
    {
      _id: '8',
      vaccine: { name: 'Vaccine D' },
      newborn: { _id: 'child2', name: 'Newborn 2' },
      dateGiven: new Date(Date.now() + 86400000 * 8).toISOString(),
    },
    {
      _id: '9',
      vaccine: { name: 'Vaccine A' },
      newborn: { _id: 'child3', name: 'Newborn 3' },
      dateGiven: new Date(Date.now() + 86400000 * 9).toISOString(),
    },
    {
      _id: '10',
      vaccine: { name: 'Vaccine B' },
      newborn: { _id: 'child1', name: 'Newborn 1' },
      dateGiven: new Date(Date.now() + 86400000 * 10).toISOString(),
    },
    {
      _id: '11',
      vaccine: { name: 'Vaccine C' },
      newborn: { _id: 'child2', name: 'Newborn 2' },
      dateGiven: new Date(Date.now() + 86400000 * 11).toISOString(),
    },
    {
      _id: '12',
      vaccine: { name: 'Vaccine D' },
      newborn: { _id: 'child3', name: 'Newborn 3' },
      dateGiven: new Date(Date.now() + 86400000 * 12).toISOString(),
    },
    {
      _id: '13',
      vaccine: { name: 'Vaccine A' },
      newborn: { _id: 'child1', name: 'Newborn 1' },
      dateGiven: new Date(Date.now() + 86400000 * 13).toISOString(),
    },
    {
      _id: '14',
      vaccine: { name: 'Vaccine B' },
      newborn: { _id: 'child2', name: 'Newborn 2' },
      dateGiven: new Date(Date.now() + 86400000 * 14).toISOString(),
    },
    {
      _id: '15',
      vaccine: { name: 'Vaccine C' },
      newborn: { _id: 'child3', name: 'Newborn 3' },
      dateGiven: new Date(Date.now() + 86400000 * 15).toISOString(),
    },
  ],
};

export default VaccinationCalendar;
