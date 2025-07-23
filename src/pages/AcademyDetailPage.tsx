import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, User as UserIcon, ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react';
import { GallerySection } from '../components/GallerySection';
import { PricingSection } from '../components/PricingSection';
import { Academy, Booking, Field } from '../types';
import { addDays, startOfWeek, format } from 'date-fns';
import { ErrorPopup } from '../components/ErrorPopup';
import { API_URL } from '../config/api';
import { useLanguage } from '../contexts/LanguageContext';

const HOURS = ['19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00'];

export const AcademyDetailPage: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selected, setSelected] = useState<{ date: Date; hour: string } | null>(null);
  const [form, setForm] = useState<{ firstName: string; lastName: string; phone: string; email: string }>({ firstName: '', lastName: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneRegex = /^\+212[5-7]\d{8}$/;
  const phoneValid = phoneRegex.test(form.phone);
  const [pendingBooking, setPendingBooking] = useState<(Booking & { field: Field; date: Date }) | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Helper to fetch bookings for the current week
  const fetchBookings = () => {
    if (!academy) return;
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    const fieldIds = academy.fields.map(f => String(f.id));
    fetch(`${API_URL}/bookings`)
      .then(res => res.json())
      .then(data => {
        setBookings(
          data.filter((b: Booking) =>
            fieldIds.includes(String(b.fieldId)) &&
            new Date(b.date) >= weekStart &&
            new Date(b.date) <= weekEnd
          )
        );
      });
  };

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/academies`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((a: Academy) => String(a.id) === String(id));
        setAcademy(found || null);
        setSelectedField(found?.fields[0] || null);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchBookings();
  }, [academy, id, currentWeek]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>;
  if (!academy) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Academy not found</h2>
          <Link to="/" className="text-green-600 hover:text-green-700 mt-4 inline-block">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  // Gather all field images for the carousel
  const images = academy.fields ? academy.fields.map(f => f.image) : [];
  const galleryImages = academy.gallery || images;
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Helper to check if a slot is booked
  const isBooked = (fieldId: string | number, date: Date, hour: string) => {
    return bookings.some(b => {
      const bookingDate = new Date(b.date);
      return (
        String(b.fieldId) === String(fieldId) &&
        bookingDate.getFullYear() === date.getFullYear() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getDate() === date.getDate() &&
        b.time === hour
      );
    });
  };

  // Handle booking form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !selectedField) return;
    if (!phoneValid) {
      setPhoneTouched(true);
      setSubmitting(false);
      return;
    }
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.email.trim()) {
      alert('Please fill in all required fields including email address.');
      return;
    }
    setSubmitting(true);
    try {
      const customerName = form.firstName.trim() + ' ' + form.lastName.trim();
      const localDate = new Date(selected.date.getFullYear(), selected.date.getMonth(), selected.date.getDate());
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldId: selectedField.id,
          date: localDate.toISOString(),
          time: selected.hour,
          customerName: customerName,
          customerPhone: form.phone,
          customerEmail: form.email
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Booking failed');
      }
      const booking = await res.json();
      setPendingBooking({
        ...booking,
        field: selectedField,
        date: localDate,
        customerName: customerName,
        customerPhone: form.phone
      });
      setShowConfirmModal(true);
      setSelected(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Booking failed';
      setError(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
              <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">{t('academyProfile')}</h1>
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Section */}
        <div className="mb-8">
          <div className="relative h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden">
            {images && images.length > 0 ? (
              <img
                src={images[0]}
                alt={`${academy.name} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{academy.name}</h1>
                  <p className="text-lg sm:text-xl opacity-90">Football Academy</p>
                </div>
              </div>
            )}
            {/* Overlay with academy name */}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg">{academy.name}</h1>
                <p className="text-lg sm:text-xl opacity-90 drop-shadow-lg">Football Academy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('info')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
                  <p className="text-sm text-gray-600">{t('openingHours')}</p>
                  <p className="font-medium text-gray-900">16:00 - 17:00</p>
                  <p className="text-sm text-gray-500">4 PM - 5 PM</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">{t('location')}</p>
                  <p className="font-medium text-gray-900">070:F788 S63</p>
                  <p className="text-sm text-gray-500">@footBookly.com</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">{t('location')}</p>
                  <p className="font-medium text-gray-900">Allis: FootBooiny</p>
          </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">FootBooking</p>
                </div>
              </div>
            </div>
          </div>


            </div>

        {/* Gallery Section */}
        <div className="mb-8">
          <GallerySection 
            images={galleryImages}
            title={t('gallery')}
          />
        </div>

        {/* Pricing Section */}
        <div className="mb-8">
          <PricingSection 
            monthlyPrice={academy.monthlyPrice || 500}
            academyName={academy.name}
          />
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('bookField')}</h2>
          
        {/* Tabs for fields */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto">
          {academy.fields && academy.fields.map((field, index) => (
            <button
              key={field.id}
              className={`px-3 sm:px-4 py-2 rounded-t-md font-medium border-b-2 transition-colors text-sm sm:text-base whitespace-nowrap ${selectedField && selectedField.id === field.id ? 'border-green-600 text-green-700 bg-white' : 'border-transparent text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setSelectedField(field)}
            >
              {field.type} #{index + 1}
            </button>
          ))}
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <span className="font-medium text-gray-700 text-sm sm:text-base">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Timetable for selected field */}
        {selectedField && (
          <div className="overflow-x-auto">
            <table className="w-full border text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-2 sm:px-3 font-medium text-gray-700 bg-gray-50">Hour</th>
                  {weekDays.map((day, idx) => (
                    <th key={idx} className="text-center py-2 px-1 sm:px-3 font-medium text-gray-700 bg-gray-50">
                      <div className="hidden sm:block">{format(day, 'EEE')}</div>
                      <div className="sm:hidden">{format(day, 'E')}</div>
                      <div className="text-xs text-gray-500">{format(day, 'MMM d')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map(hour => (
                  <tr key={hour}>
                    <td className="py-2 px-2 sm:px-3 font-medium text-gray-700 bg-gray-50">{hour}</td>
                    {weekDays.map((day, dayIdx) => {
                      const booked = isBooked(selectedField.id, day, hour);
                      const now = new Date();
                      const isToday =
                        day.getFullYear() === now.getFullYear() &&
                        day.getMonth() === now.getMonth() &&
                        day.getDate() === now.getDate();
                      const [h, m] = hour.split(":");
                      const slotDate = new Date(day);
                      slotDate.setHours(Number(h), Number(m || 0), 0, 0);
                      const isPast = (day < new Date(now.getFullYear(), now.getMonth(), now.getDate())) || (isToday && slotDate < now);
                      const disabled = booked || isPast;
                      return (
                        <td key={dayIdx} className="py-1 sm:py-2 px-1 sm:px-3 text-center">
                          <button
                            className={`w-full p-1 sm:p-2 rounded-md text-xs sm:text-sm font-medium transition-all ${booked ? 'bg-red-100 text-red-800 cursor-not-allowed' : disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'}`}
                            disabled={disabled}
                            onClick={() => !disabled && setSelected({ date: day, hour })}
                          >
                            <span className="hidden sm:inline">{booked ? 'Booked' : disabled ? 'Unavailable' : 'Available'}</span>
                            <span className="sm:hidden">{booked ? '❌' : disabled ? '⏰' : '✅'}</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-4 text-xs mt-2">
              <div className="flex items-center"><span className="w-3 h-3 bg-green-100 rounded mr-2 inline-block"></span><span className="hidden sm:inline">Available</span><span className="sm:hidden">✅</span></div>
              <div className="flex items-center"><span className="w-3 h-3 bg-red-100 rounded mr-2 inline-block"></span><span className="hidden sm:inline">Booked</span><span className="sm:hidden">❌</span></div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Booking Modal */}
      {selected && selectedField && !showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-md font-['Poppins'] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Book {selectedField.type} at {selected.hour} on {format(selected.date, 'MMM d, yyyy')}</h3>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                <div className="flex-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      id="firstName"
                      required
                      value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                      placeholder="First name"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      id="lastName"
                      required
                      value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    onBlur={() => setPhoneTouched(true)}
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="e.g. +212612345678"
                  />
                </div>
                {(phoneTouched || form.phone) && (
                  <div style={{ color: phoneValid ? '#888' : 'red', fontSize: '0.8em' }} className="mt-1">
                    Example: +212612345678
                    {!phoneValid && form.phone && <span> (Invalid Moroccan number)</span>}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <div className="relative">
                  <svg className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold text-sm sm:text-base"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg text-sm sm:text-base"
                  disabled={submitting}
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && pendingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-md font-['Poppins'] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Confirm Your Reservation</h3>
            <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Field:</span>
                <span className="text-gray-900 text-sm sm:text-base">{pendingBooking.field.type} #{pendingBooking.field.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Date:</span>
                <span className="text-gray-900 text-sm sm:text-base">{format(pendingBooking.date, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Time:</span>
                <span className="text-gray-900 text-sm sm:text-base">{pendingBooking.time}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Name:</span>
                <span className="text-gray-900 text-sm sm:text-base">{pendingBooking.customerName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Phone:</span>
                <span className="text-gray-900 text-sm sm:text-base">{pendingBooking.customerPhone}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-gray-700 text-sm sm:text-base">Email:</span>
                <span className="text-gray-900 text-sm sm:text-base">{pendingBooking.customerEmail}</span>
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <button
                className="w-full sm:w-auto py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg text-sm sm:text-base"
                onClick={async () => {
                  try {
                    const response = await fetch(`${API_URL}/send-email`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: pendingBooking.customerEmail,
                        bookingDetails: {
                          bookingId: pendingBooking.id,
                          fieldName: pendingBooking.field.type,
                          fieldId: pendingBooking.field.id,
                          date: format(pendingBooking.date, 'EEEE, MMMM d, yyyy'),
                          time: pendingBooking.time,
                          customerName: pendingBooking.customerName,
                          customerPhone: pendingBooking.customerPhone,
                          customerEmail: pendingBooking.customerEmail,
                          academyName: academy?.name || 'Football Academy'
                        }
                      })
                    });
                    
                    const result = await response.json();
                    
                    setShowConfirmModal(false);
                    setPendingBooking(null);
                    setForm({ firstName: '', lastName: '', phone: '', email: '' });
                    fetchBookings();
                    
                    if (result.success) {
                      setError('🎉 Booking confirmed successfully! ⚽ Email confirmation sent! 📧');
                    } else {
                      setError('✅ Booking confirmed successfully! ⚽ (Email service temporarily unavailable) 📧');
                    }
                    setShowErrorPopup(true);
                  } catch (error) {
                    console.error('Error sending email:', error);
                    setShowConfirmModal(false);
                    setPendingBooking(null);
                    setForm({ firstName: '', lastName: '', phone: '', email: '' });
                    fetchBookings();
                    setError('✅ Booking confirmed successfully! ⚽ (Email service unavailable) 📧');
                    setShowErrorPopup(true);
                  }
                }}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Popup */}
      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        error={error || ''}
        type={error?.includes('successfully') ? 'success' : 'error'}
      />
    </div>
  );
};