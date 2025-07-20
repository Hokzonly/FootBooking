import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { useBookingContext } from '../contexts/BookingContext';
import { Academy, Booking, Field } from '../types';
import { ErrorPopup } from '../components/ErrorPopup';
import { API_URL } from '../config/api';

export const BookingCalendarPage: React.FC = () => {
  const { academyId, fieldId } = useParams<{ academyId: string; fieldId: string }>();
  const navigate = useNavigate();
  const { createBooking } = useBookingContext();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [field, setField] = useState<Field | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  useEffect(() => {
    // Fetch academies and set current academy/field
    fetch(`${API_URL}/academies`)
      .then(res => res.json())
      .then(data => {
        const foundAcademy = data.find((a: Academy) => String(a.id) === String(academyId));
        setAcademy(foundAcademy || null);
        const foundField = foundAcademy?.fields.find((f: Field) => String(f.id) === String(fieldId));
        setField(foundField || null);
      });
  }, [academyId, fieldId]);

  useEffect(() => {
    // Fetch all bookings for this field
    if (!fieldId) return;
    fetch(`${API_URL}/bookings`)
      .then(res => res.json())
      .then(data => {
        setBookings(data.filter((b: Booking) => String(b.fieldId) === String(fieldId)));
        setLoading(false);
      });
  }, [fieldId]);

  if (!academy || !field || loading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>;
  }

  const timeSlots = [
    '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00'
  ];

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSlotStatus = (date: Date, time: string) => {
    const booking = bookings.find(b => 
      isSameDay(new Date(b.date), date) &&
      b.time === time
    );
    return booking ? 'booked' : 'available';
  };

  const getBookingInfo = (date: Date, time: string) => {
    return bookings.find(b => 
      isSameDay(new Date(b.date), date) &&
      b.time === time
    );
  };

  const handleSlotClick = (date: Date, time: string) => {
    const status = getSlotStatus(date, time);
    if (status === 'available') {
      setSelectedSlot({ date, time });
      setShowBookingForm(true);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    // Validate required fields
    if (!bookingData.firstName.trim() || !bookingData.lastName.trim() || !bookingData.phone.trim() || !bookingData.email.trim()) {
      alert('Please fill in all required fields including email address.');
      return;
    }

    try {
      const booking = await createBooking({
        academyId: academyId!,
        fieldId: String(fieldId),
        academyName: academy.name,
        fieldType: field.type,
        date: selectedSlot.date.toISOString().slice(0, 10),
        time: selectedSlot.time,
        customerName: bookingData.firstName.trim() + ' ' + bookingData.lastName.trim(),
        customerPhone: bookingData.phone,
        customerEmail: bookingData.email
      });
      navigate(`/confirmation/${booking.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Booking failed';
      setError(errorMessage);
      setShowErrorPopup(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book {field.type}</h1>
        <p className="text-lg text-gray-600">{academy.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Select Date & Time</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentDate(addDays(currentDate, -7))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium text-gray-700">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 7))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-2">
          <div className="p-3 text-center font-medium text-gray-700">Time</div>
          {weekDays.map((day, index) => (
            <div key={index} className="p-3 text-center">
              <div className="font-medium text-gray-900">{format(day, 'EEE')}</div>
              <div className="text-sm text-gray-600">{format(day, 'MMM d')}</div>
            </div>
          ))}
          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              <div className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50 rounded-md">
                {time}
              </div>
              {weekDays.map((day, dayIndex) => {
                const status = getSlotStatus(day, time);
                const booking = getBookingInfo(day, time);
                const isBooked = status === 'booked';
                return (
                  <div
                    key={`${time}-${dayIndex}`}
                    className={`p-3 text-center text-sm rounded-md transition-all cursor-${isBooked ? 'not-allowed' : 'pointer'} ${
                      isBooked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                    onClick={() => {
                      if (!isBooked) handleSlotClick(day, time);
                    }}
                  >
                    {isBooked ? (
                      <div>
                        <div className="font-medium">Booked</div>
                        <div className="text-xs">{booking?.customerName}</div>
                      </div>
                    ) : (
                      <span className="font-medium">Available</span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
            <span className="text-gray-700">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
            <span className="text-gray-700">Booked</span>
          </div>
        </div>
      </div>

      {showBookingForm && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Your Booking</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">{format(selectedSlot.date, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-700">{selectedSlot.time} - {parseInt(selectedSlot.time.split(':')[0]) + 1}:00</span>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      required
                      value={bookingData.firstName}
                      onChange={(e) => setBookingData({ ...bookingData, firstName: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="First name"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      required
                      value={bookingData.lastName}
                      onChange={(e) => setBookingData({ ...bookingData, lastName: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    required
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Error Popup */}
      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        error={error || ''}
        type="error"
      />
    </div>
  );
};