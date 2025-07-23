import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Trash2, LogOut, Shield } from 'lucide-react';
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

const formats = {
  timeGutterFormat: (date, culture, localizer) => localizer.format(date, 'HH:mm', culture),
  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
    `${localizer.format(start, 'HH:mm', culture)} – ${localizer.format(end, 'HH:mm', culture)}`,
};

export const AcademyAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedField, setSelectedField] = useState('all');
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    const userInfo = localStorage.getItem('userInfo');
    
    if (!isLoggedIn || !userInfo) {
      navigate('/admin/login');
      return;
    }

    const user = JSON.parse(userInfo);
    if (user.role !== 'ACADEMY_ADMIN') {
      navigate('/admin/dashboard');
      return;
    }

    // Fetch academy-specific data
    fetch(`${API_URL}/api/academy/my-academy`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setAcademy(data);
      setFields(data.fields || []);
      
      // Fetch bookings for this academy only
      return fetch(`${API_URL}/academies/${data.id}/bookings`);
    })
    .then(res => res.json())
    .then(data => {
      setBookings(data);
      setLoading(false);
    })
    .catch(() => {
      setLoading(false);
    });
  }, [navigate]);

  const handleCancelBooking = async (bookingId: string) => {
    const confirmed = window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Remove the booking from local state
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('Cancel booking error:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userInfo');
    navigate('/admin/login');
  };

  // Helper function to get field display name with academy-specific numbering
  const getFieldDisplayName = (field: any, index: number) => {
    return `${field.type} #${index + 1}`;
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
    const [h, m] = booking.time.split(':');
    const start = new Date(date);
    start.setHours(Number(h), Number(m || 0), 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    
    const field = fields.find(f => f.id === Number(booking.fieldId));
    const fieldIndex = fields.findIndex(f => f.id === Number(booking.fieldId));
    const fieldDisplayName = field ? getFieldDisplayName(field, fieldIndex) : `Field #${booking.fieldId}`;
    
    return {
      id: booking.id,
      title: `${booking.customerName} (${fieldDisplayName})`,
      start,
      end,
      resource: booking,
    };
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const stats = {
    totalBookings: thisWeekBookings.length,
    averageBookingsPerDay: (thisWeekBookings.length / 7).toFixed(1),
    totalFields: fields.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your academy dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academy Dashboard</h1>
          <p className="text-gray-600 mt-1">{academy?.name}</p>
          <div className="flex items-center mt-2">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-600">Academy Admin View</span>
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week's Bookings</p>
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fields</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFields}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
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
            {fields.map((field, index) => (
              <option key={field.id} value={field.id}>
                {getFieldDisplayName(field, index)}
              </option>
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

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Phone
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Actions
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {filteredBookings.map((booking) => {
                   const field = fields.find(f => f.id === Number(booking.fieldId));
                   const fieldIndex = fields.findIndex(f => f.id === Number(booking.fieldId));
                   const fieldDisplayName = field ? getFieldDisplayName(field, fieldIndex) : `Field #${booking.fieldId}`;
                   
                   return (
                     <tr key={booking.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                         <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                           {fieldDisplayName}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900">{format(new Date(booking.date), 'MMM d, yyyy')}</div>
                         <div className="text-sm text-gray-500">{booking.time}</div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {booking.customerPhone}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         <button
                           onClick={() => handleCancelBooking(booking.id)}
                           className="text-red-600 hover:text-red-800 transition-colors"
                           title="Cancel booking"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                       </td>
                     </tr>
                   );
                 })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            formats={formats}
            views={['month', 'week', 'day']}
            defaultView="week"
            step={60}
            timeslots={1}
          />
        </div>
      )}
    </div>
  );
}; 