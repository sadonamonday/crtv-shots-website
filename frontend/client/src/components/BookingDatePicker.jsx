import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { mapDateStringsToDates, formatYyyyMmDd, startOfDay } from '../utils/dateHelpers';

/*
  Props:
    - value: string (YYYY-MM-DD) | null
    - onChange: (yyyyMmDdString) => void
    - availableDateStrings: string[] (YYYY-MM-DD)
*/
export default function BookingDatePicker({ value, onChange, availableDateStrings = [] }) {
  const allowedDates = mapDateStringsToDates(availableDateStrings);
  const selected = value ? new Date(value) : null;
  const today = startOfDay(new Date());

  if (!allowedDates || allowedDates.length === 0) {
    return (
      <div className="text-gray-400 text-sm border border-gray-700 rounded p-3 bg-gray-900">
        No dates available.
      </div>
    );
  }

  // Only allow clicking on allowedDates via includeDates
  return (
    <div className="booking-date-picker">
      <DatePicker
        inline
        selected={selected}
        onChange={(d) => {
          if (d) onChange(formatYyyyMmDd(d));
          else onChange('');
        }}
        includeDates={allowedDates}
        minDate={today}
        calendarStartDay={1}
        dayClassName={(date) => {
          // style disabled days via CSS class
          const isAllowed = allowedDates.some((d) => d.getTime() === startOfDay(date).getTime());
          return isAllowed ? 'rdp-allowed' : 'rdp-disabled';
        }}
      />
      <style>{`
        /* Additional emphasis for disabled days */
        .booking-date-picker .react-datepicker__day.rdp-disabled,
        .booking-date-picker .react-datepicker__day--disabled {
          color: #6b7280 !important; /* gray-500 */
          opacity: 0.6;
          pointer-events: none;
        }
        .booking-date-picker .react-datepicker__day.rdp-allowed {
          color: #e5e7eb; /* gray-200 */
        }
        .booking-date-picker .react-datepicker__day--selected,
        .booking-date-picker .react-datepicker__day--keyboard-selected {
          background-color: #3b82f6 !important; /* blue-500 */
          color: white !important;
        }
        .booking-date-picker .react-datepicker__header {
          background-color: #111827; /* gray-900 */
          border-bottom: 1px solid #374151; /* gray-700 */
        }
        .booking-date-picker .react-datepicker__current-month,
        .booking-date-picker .react-datepicker-time__header,
        .booking-date-picker .react-datepicker-year-header { color: #e5e7eb; }
        .booking-date-picker .react-datepicker__day-name { color: #9ca3af; }
        .booking-date-picker .react-datepicker__month { background-color: #0b1220; }
        .booking-date-picker .react-datepicker { border-color: #374151; background: #0b1220; }
      `}</style>
    </div>
  );
}
