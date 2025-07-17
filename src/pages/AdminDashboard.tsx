import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Trash2, LogOut } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Academy, Booking } from '../types';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parse, startOfWeek as dfStartOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { API_URL } from '../config/api';

const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: dfStartOfWeek,
  getDay,
  locales,
});

// Helper for 24-hour time formatting
const formats = {
  timeGutterFormat: (date, culture, localizer) => localizer.format(date, 'HH:mm', culture),
  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
    `${localizer.format(start, 'HH:mm', culture)} – ${localizer.format(end, 'HH:mm', culture)}`,
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedField, setSelectedField] = useState('all');
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetch(`${API_URL}/academies`)
      .then(res => res.json())
      .then(data => {
        setAcademy(data[0]);
        setFields(data[0]?.fields || []);
      });
    fetch(`${API_URL}/bookings`)
      .then(res => res.json())
      .then(data => setBookings(data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin/login');
  };

  const allBookings = bookings;
  const thisWeekBookings = allBookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    return bookingDate >= weekStart && bookingDate <= weekEnd;
  });

  // Filter bookings based on UI controls
  const filteredBookings = allBookings.filter(booking => {
    let matches = true;
    if (filterDate) {
      matches = matches && isSameDay(new Date(booking.date), filterDate);
    }
    if (selectedField !== 'all') {
      matches = matches && String(booking.fieldId) === String(selectedField);
    }
    if (customerSearch) {
      const search = customerSearch.toLowerCase();
      matches = matches && (
        booking.customerName.toLowerCase().includes(search) ||
        booking.customerPhone.toLowerCase().includes(search)
      );
    }
    return matches;
  });

  // Map bookings to calendar events
  const calendarEvents = filteredBookings.map(booking => {
    const date = new Date(booking.date);
    // Parse hour (e.g., '19:00')
    const [h, m] = booking.time.split(':');
    const start = new Date(date);
    start.setHours(Number(h), Number(m || 0), 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1); // Assume 1 hour per booking
    return {
      id: booking.id,
      title: `${booking.customerName} (${booking.fieldType || booking.fieldId})`,
      start,
      end,
      resource: booking,
    };
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const stats = {
    totalBookings: thisWeekBookings.length,
    averageBookingsPerDay: (thisWeekBookings.length / 7).toFixed(1)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">{academy?.name}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Bookings/Day</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageBookingsPerDay}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filter/Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <DatePicker
            selected={filterDate}
            onChange={date => setFilterDate(date)}
            placeholderText="Select date"
            className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-48"
            isClearable
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
          <select
            value={selectedField}
            onChange={e => setSelectedField(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-48"
          >
            <option value="all">All Fields</option>
            {fields.map(field => (
              <option key={field.id} value={field.id}>{field.type} #{field.id}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <input
            type="text"
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
            placeholder="Search by name or phone"
            className="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-md font-medium border transition-colors ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setViewMode('list')}
        >
          List View
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium border transition-colors ${viewMode === 'calendar' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setViewMode('calendar')}
        >
          Calendar View
        </button>
      </div>

      {viewMode === 'list' && (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Field</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">{booking.customerName}</td>
                  <td className="py-3 px-4">{booking.customerPhone}</td>
                  <td className="py-3 px-4">{booking.fieldType || booking.fieldId}</td>
                  <td className="py-3 px-4">{format(new Date(booking.date), 'MMM d, yyyy')}</td>
                  <td className="py-3 px-4">{booking.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bookings Calendar</h2>
          {/* Custom grid calendar view */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-2">
              <div className="p-3 text-center font-medium text-gray-700">Time</div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-3 text-center">
                  <div className="font-medium text-gray-900">{format(day, 'EEE')}</div>
                  <div className="text-sm text-gray-600">{format(day, 'MMM d')}</div>
                </div>
              ))}
              {["19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00"].map((time) => (
                <React.Fragment key={time}>
                  <div className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50 rounded-md">
                    {time}
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    // Find booking for this day/time/field
                    const booking = filteredBookings.find(b =>
                      isSameDay(new Date(b.date), day) &&
                      b.time === time &&
                      (selectedField === 'all' || String(b.fieldId) === String(selectedField))
                    );
                    return (
                      <div
                        key={`${time}-${dayIndex}`}
                        className={`p-3 text-center text-xs rounded-md transition-all ${
                          booking
                            ? 'bg-green-600 text-white font-semibold'
                            : 'bg-green-50 text-green-900'
                        }`}
                      >
                        {booking ? (
                          <div>
                            <div>{booking.customerName}</div>
                            <div className="text-[10px]">{booking.fieldType || booking.fieldId}</div>
                            <div className="text-[10px]">{booking.customerPhone}</div>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};