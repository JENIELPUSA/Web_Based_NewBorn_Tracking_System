import React, { useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { motion } from 'framer-motion';
import '../Calendar/VaccinationCalendar.css';

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const VaccinationCalendar = ({ selectedChildId, vaccinationRecords = [] }) => {
  const markedDates = useMemo(() => {
    if (!selectedChildId || !vaccinationRecords?.length) return vaccinationRecords;
    return vaccinationRecords.filter(record => record.newborn._id === selectedChildId);
  }, [selectedChildId, vaccinationRecords]);

  const markedDateStrings = useMemo(() => {
    return markedDates.map(record => formatDate(new Date(record.dateGiven)));
  }, [markedDates]);

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
            className="w-3 h-3 bg-rose-500 rounded-full shadow-sm cursor-pointer mb-1"
            data-tooltip-id={`tooltip-${record._id}`}
            data-tooltip-content={`💉 ${record.vaccine.name}\n👶 ${record.newborn.name}`}
            data-tooltip-place="top"
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
        {isNextSchedule && (
          <motion.div
            className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800 absolute -top-1 -right-1 shadow-lg"
            data-tooltip-id={`tooltip-next-${dateString}`}
            data-tooltip-content={`📅 Next: ${nextScheduleRecord.vaccine.name} for ${nextScheduleRecord.newborn.name}`}
            data-tooltip-place="top"
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-6xl mx-auto border border-gray-100 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
          Vaccination Calendar
        </span>
      </h2>

      <div className="w-full">
        <Calendar
          tileContent={getTileContent}
          className="rounded-xl border-none w-full bg-transparent"
          tileClassName={({ date, view }) =>
            view === 'month' && markedDateStrings.includes(formatDate(date))
              ? 'has-vaccination'
              : null
          }
        />
      </div>

      {/* Vaccine Tooltips */}
      {markedDates.map((record) => (
        <ReactTooltip
          key={`tooltip-${record._id}`}
          id={`tooltip-${record._id}`}
          className="!bg-white !text-gray-800 dark:!bg-slate-800 dark:!text-gray-200 !shadow-lg !rounded-lg !p-3 !border !border-gray-200 dark:!border-slate-700 !backdrop-blur-sm"
          float={true}
          positionStrategy="fixed"
        />
      ))}

      {/* Next Schedule Tooltip */}
      {nextScheduleRecord && (
        <ReactTooltip
          id={`tooltip-next-${formatDate(new Date(nextScheduleRecord.dateGiven))}`}
          className="!bg-blue-100 !text-blue-900 dark:!bg-blue-950 dark:!text-blue-300 !shadow-xl !rounded-lg !p-3 !border !border-blue-300 dark:!border-blue-800"
          float={true}
          positionStrategy="fixed"
        />
      )}

      {/* Global Style Customization */}
      <style jsx global>{`
        .react-calendar {
          width: 100%;
          font-size: 1rem;
          background: transparent;
        }

        .react-calendar__tile {
          min-height: 85px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 0.5rem;
          border-radius: 0.75rem;
          transition: all 0.2s ease;
          border: 1px solid #f1f5f9;
          background-color: white;
          color: black;
        }

        .react-calendar__month-view__days__day {
          color: #333; /* Light mode default */
        }

        .dark .react-calendar__month-view__days__day {
          color: #e2e8f0; /* Dark mode text */
        }

        .dark .react-calendar__tile {
          background-color: #1e293b;
          color: #e2e8f0;
          border-color: #334155;
        }

        .has-vaccination {
          background-color: #fff7ed;
          border-color: #fdba74;
        }

        .dark .has-vaccination {
          background-color: #3b0764;
          border-color: #9333ea;
        }

        @media (max-width: 768px) {
          .react-calendar__tile {
            min-height: 70px;
          }
        }

        @media (max-width: 480px) {
          .react-calendar__tile {
            min-height: 60px;
            font-size: 0.75rem;
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
      vaccine: { name: 'Polio Vaccine' },
      newborn: { _id: 'child1', name: 'Juan Dela Cruz' },
      dateGiven: new Date().toISOString(),
    },
    {
      _id: '2',
      vaccine: { name: 'Hepatitis B' },
      newborn: { _id: 'child1', name: 'Juan Dela Cruz' },
      dateGiven: new Date(Date.now() + 86400000 * 2).toISOString(),
    },
    {
      _id: '3',
      vaccine: { name: 'MMR' },
      newborn: { _id: 'child2', name: 'Maria Clara' },
      dateGiven: new Date(Date.now() + 86400000 * 4).toISOString(),
    },
  ],
};

export default VaccinationCalendar;
