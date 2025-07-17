import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { AcademyDetailPage } from './pages/AcademyDetailPage';
import { BookingCalendarPage } from './pages/BookingCalendarPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';
import { BookingProvider } from './contexts/BookingContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <BookingProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/academy/:id" element={<AcademyDetailPage />} />
            <Route path="/booking/:academyId/:fieldId" element={<BookingCalendarPage />} />
            <Route path="/confirmation/:bookingId" element={<BookingConfirmationPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
      </Router>
    </BookingProvider>
  );
}

export default App;