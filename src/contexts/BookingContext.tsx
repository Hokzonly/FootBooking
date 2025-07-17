import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Booking } from '../types';
import { API_URL } from '../config/api';

interface BookingContextType {
  bookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id'>) => Promise<Booking>;
  getBooking: (id: string) => Booking | undefined;
  getAllBookings: () => Booking[];
  cancelBooking: (id: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      academyId: '1',
      fieldId: '1',
      academyName: 'Elite Football Academy',
      fieldType: '5v5 Field',
      date: '2024-01-15',
      time: '18:00',
      customerName: 'John Doe',
      customerPhone: '+1234567890'
    },
    {
      id: '2',
      academyId: '1',
      fieldId: '2',
      academyName: 'Elite Football Academy',
      fieldType: '7v7 Field',
      date: '2024-01-16',
      time: '19:00',
      customerName: 'Jane Smith',
      customerPhone: '+1234567891'
    }
  ]);

  const createBooking = async (bookingData: Omit<Booking, 'id'>): Promise<Booking> => {
    console.log('createBooking called with:', bookingData);
    
    const requestBody = {
      fieldId: Number(bookingData.fieldId), // Convert to number for backend
      date: bookingData.date,
      time: bookingData.time,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      customerEmail: bookingData.customerEmail
    };
    
    console.log('Sending booking request:', requestBody);
    console.log('customerEmail in requestBody:', requestBody.customerEmail);
    console.log('fieldId type:', typeof requestBody.fieldId);
    
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fieldId: Number(bookingData.fieldId), // Convert to number for backend
        date: bookingData.date,
        time: bookingData.time,
        customerName: bookingData.customerName,
        customerPhone: bookingData.customerPhone,
        customerEmail: bookingData.customerEmail,
        academyId: bookingData.academyId,
        academyName: bookingData.academyName,
        fieldType: bookingData.fieldType
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Booking failed:', errorText);
      throw new Error('Booking failed: ' + errorText);
    }
    
    const booking = await response.json();
    setBookings(prev => [...prev, booking]);
    return booking;
  };

  const getBooking = (id: string): Booking | undefined => {
    return bookings.find(booking => booking.id === id);
  };

  const getAllBookings = (): Booking[] => {
    return bookings;
  };

  const cancelBooking = (id: string): void => {
    setBookings(prev => prev.filter(booking => booking.id !== id));
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      createBooking,
      getBooking,
      getAllBookings,
      cancelBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
};