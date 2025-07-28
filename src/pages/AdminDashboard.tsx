import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Trash2, LogOut, Building, CheckCircle, DollarSign, Settings, BarChart3, UserPlus, Edit, Eye, Plus, Upload, X, Shield } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'overview' | 'academies' | 'users'>('overview');

  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [userAcademyId, setUserAcademyId] = useState<number | null>(null);
  const [showAcademyForm, setShowAcademyForm] = useState(false);
  const [showAcademyAdminForm, setShowAcademyAdminForm] = useState(false);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAcademyForm, setEditAcademyForm] = useState({
    name: '',
    location: '',
    phone: '',
    description: '',
    openingHours: '',
    monthlyPrice: 0,
    image: '',
    gallery: [] as string[],
    fields: [] as Array<{
      type: string;
      capacity: number;
      pricePerHour: number;
      image: string;
    }>
  });
  
  // Academy form state
  const [academyForm, setAcademyForm] = useState({
    name: '',
    location: '',
    phone: '',
    description: '',
    openingHours: '',
    monthlyPrice: 0,
    image: '',
    gallery: [] as string[],
    fields: [] as Array<{
      type: string;
      capacity: number;
      pricePerHour: number;
      image: string;
    }>
  });

  // Academy admin form state
  const [academyAdminForm, setAcademyAdminForm] = useState({
    email: '',
    password: '',
    name: '',
    academyId: ''
  });

  // Academy admin management state
  const [academyAdmins, setAcademyAdmins] = useState<any[]>([]);
  const [showEditAcademyAdminModal, setShowEditAcademyAdminModal] = useState(false);
  const [editingAcademyAdmin, setEditingAcademyAdmin] = useState<any>(null);
  const [editAcademyAdminForm, setEditAcademyAdminForm] = useState({
    email: '',
    password: '',
    name: '',
    academyId: ''
  });

  const [systemStats, setSystemStats] = useState({
    totalAcademies: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeAcademies: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Define fetch functions first
  const fetchAcademies = async () => {
    try {
      const response = await fetch(`${API_URL}/academies`);
      const data = await response.json();
      setAcademies(data);
    } catch (error) {
      console.error('Error fetching academies:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/bookings`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchFields = async () => {
    try {
      const response = await fetch(`${API_URL}/fields`);
      const data = await response.json();
      setFields(data);
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  const fetchMyAcademy = async () => {
    try {
      const response = await fetch(`${API_URL}/api/academy/my-academy`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      setAcademy(data);
    } catch (error) {
      console.error('Error fetching my academy:', error);
    }
  };

  const fetchAcademyBookings = async () => {
    if (!userAcademyId) return;
    try {
      console.log('Fetching bookings for academy ID:', userAcademyId);
      const response = await fetch(`${API_URL}/academies/${userAcademyId}/bookings`);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Bookings data:', data);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching academy bookings:', error);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const [academiesRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/academies`),
        fetch(`${API_URL}/bookings`)
      ]);
      
      const academies = await academiesRes.json();
      const bookings = await bookingsRes.json();
      
      const totalRevenue = bookings.reduce((sum: number, booking: any) => {
        const field = fields.find(f => f.id === Number(booking.fieldId));
        return sum + (field?.pricePerHour || 0);
      }, 0);
      
      setSystemStats({
        totalAcademies: academies.length,
        totalUsers: 0, // Would need user endpoint
        totalBookings: bookings.length,
        totalRevenue,
        activeAcademies: academies.length
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const [academiesRes, bookingsRes, academyAdminsRes] = await Promise.all([
        fetch(`${API_URL}/academies`),
        fetch(`${API_URL}/bookings`),
        fetch(`${API_URL}/api/admin/academy-admins`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        })
      ]);
      
      const academies = await academiesRes.json();
      const bookings = await bookingsRes.json();
      const academyAdmins = academyAdminsRes.ok ? await academyAdminsRes.json() : [];
      
      const activities = [];
      
      // Add recent academies
      const recentAcademies = academies
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3);
      
      recentAcademies.forEach((academy: any) => {
        activities.push({
          id: `academy-${academy.id}`,
          type: 'academy_created',
          title: `New academy created: ${academy.name}`,
          description: academy.location,
          timestamp: academy.createdAt || new Date().toISOString(),
          color: 'green'
        });
      });
      
      // Add recent bookings
      const recentBookings = bookings
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3);
      
      recentBookings.forEach((booking: any) => {
        const academy = academies.find((a: any) => a.id === booking.academyId);
        activities.push({
          id: `booking-${booking.id}`,
          type: 'booking_created',
          title: `New booking at ${academy?.name || 'Unknown Academy'}`,
          description: `${booking.customerName} - ${booking.time}`,
          timestamp: booking.createdAt || new Date().toISOString(),
          color: 'blue'
        });
      });
      
      // Add recent academy admins
      const recentAdmins = academyAdmins
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 3);
      
      recentAdmins.forEach((admin: any) => {
        activities.push({
          id: `admin-${admin.id}`,
          type: 'admin_created',
          title: `Academy admin created: ${admin.email}`,
          description: admin.academy?.name || 'No academy assigned',
          timestamp: admin.createdAt || new Date().toISOString(),
          color: 'purple'
        });
      });
      
      // Sort all activities by timestamp and take the most recent 5
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
      
      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUserRole(user.role);
      setUserAcademyId(user.academyId);
      
      // Redirect academy admins to their specific dashboard
      if (user.role === 'ACADEMY_ADMIN') {
        navigate('/academy/dashboard');
        return;
      }
    }

    // Fetch data based on user role
    if (userRole === 'ADMIN') {
      // Super admin - fetch all data
      fetchAcademies();
      fetchBookings();
      fetchFields();
      fetchSystemStats();
      fetchAcademyAdmins(); // Fetch academy admins for super admin
      fetchRecentActivities(); // Fetch recent activities for super admin
    } else if (userRole === 'ACADEMY_ADMIN' && userAcademyId) {
      // Academy admin - fetch only their academy data
      fetchMyAcademy();
      fetchAcademyBookings();
    }
  }, [userRole, userAcademyId]);

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

  const handleCreateAcademyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/api/admin/academy-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(academyAdminForm)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create academy admin: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      alert('Academy admin created successfully!');
      setShowAcademyAdminForm(false);
      setAcademyAdminForm({ email: '', password: '', name: '', academyId: '' });
      fetchAcademyAdmins(); // Refresh the list
      fetchRecentActivities(); // Refresh recent activities
    } catch (error) {
      console.error('Create academy admin error:', error);
      alert(`Failed to create academy admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const fetchAcademyAdmins = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Fetching academy admins with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch(`${API_URL}/api/admin/academy-admins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Academy admins data:', data);
        setAcademyAdmins(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch academy admins:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching academy admins:', error);
    }
  };

  const handleEditAcademyAdmin = (admin: any) => {
    setEditingAcademyAdmin(admin);
    setEditAcademyAdminForm({
      email: admin.email,
      password: '', // Don't pre-fill password for security
      name: admin.name,
      academyId: admin.academy?.id?.toString() || ''
    });
    setShowEditAcademyAdminModal(true);
  };

  const handleUpdateAcademyAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updateData = {
        email: editAcademyAdminForm.email,
        name: editAcademyAdminForm.name,
        academyId: editAcademyAdminForm.academyId
      };

      // Only include password if it's provided
      if (editAcademyAdminForm.password) {
        (updateData as any).password = editAcademyAdminForm.password;
      }

      const response = await fetch(`${API_URL}/api/admin/academy-admins/${editingAcademyAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update academy admin');
      }

      alert('Academy admin updated successfully!');
      setShowEditAcademyAdminModal(false);
      setEditingAcademyAdmin(null);
      setEditAcademyAdminForm({ email: '', password: '', name: '', academyId: '' });
      fetchAcademyAdmins(); // Refresh the list
      fetchRecentActivities(); // Refresh recent activities
    } catch (error) {
      console.error('Update academy admin error:', error);
      alert('Failed to update academy admin. Please try again.');
    }
  };

  const handleDeleteAcademyAdmin = async (adminId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this academy admin? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/academy-admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete academy admin');
      }

      alert('Academy admin deleted successfully!');
      fetchAcademyAdmins(); // Refresh the list
      fetchRecentActivities(); // Refresh recent activities
    } catch (error) {
      console.error('Delete academy admin error:', error);
      alert('Failed to delete academy admin. Please try again.');
    }
  };

  const handleCreateAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      
      // Validate form data before sending
      const formData = {
        name: academyForm.name.trim(),
        location: academyForm.location.trim(),
        phone: academyForm.phone.trim(),
        description: academyForm.description.trim(),
        openingHours: academyForm.openingHours.trim(),
        monthlyPrice: Number(academyForm.monthlyPrice),
        image: academyForm.image.trim(),
        gallery: academyForm.gallery,
        fields: academyForm.fields
      };
      

      
      // Check for empty required fields
      const missingFields = [];
      if (!formData.name) missingFields.push('name');
      if (!formData.location) missingFields.push('location');
      if (!formData.phone) missingFields.push('phone');
      if (!formData.description) missingFields.push('description');
      if (!formData.openingHours) missingFields.push('openingHours');
      if (!formData.monthlyPrice || formData.monthlyPrice <= 0) missingFields.push('monthlyPrice');
      if (!formData.image) missingFields.push('image');
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
      

      
      const response = await fetch(`${API_URL}/academies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create academy: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      
      alert('Academy created successfully!');
      setShowAcademyForm(false);
      setAcademyForm({
        name: '',
        location: '',
        phone: '',
        description: '',
        openingHours: '',
        monthlyPrice: 0,
        image: '',
        gallery: [],
        fields: []
      });
      fetchAcademies(); // Refresh academies list
      fetchRecentActivities(); // Refresh recent activities
    } catch (error) {
      console.error('Create academy error:', error);
      alert(`Failed to create academy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addFieldToAcademy = () => {
    setAcademyForm(prev => ({
      ...prev,
      fields: [...prev.fields, {
        type: '',
        capacity: 0,
        pricePerHour: 0,
        image: ''
      }]
    }));
  };

  const removeFieldFromAcademy = (index: number) => {
    setAcademyForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const updateFieldInAcademy = (index: number, field: any) => {
    setAcademyForm(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? field : f)
    }));
  };

  const addGalleryImage = (imageUrl: string) => {
    setAcademyForm(prev => ({
      ...prev,
      gallery: [...prev.gallery, imageUrl]
    }));
  };

  const removeGalleryImage = (index: number) => {
    setAcademyForm(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userInfo');
    navigate('/admin/login');
  };



  const handleViewAcademy = (academy: Academy) => {
    setSelectedAcademy(academy);
    setShowViewModal(true);
  };

  const handleEditAcademy = (academy: Academy) => {
    setSelectedAcademy(academy);
    setEditAcademyForm({
      name: academy.name,
      location: academy.location,
      phone: academy.phone,
      description: academy.description,
      openingHours: academy.openingHours,
      monthlyPrice: academy.monthlyPrice,
      image: academy.image,
      gallery: academy.gallery || [],
      fields: academy.fields?.map(field => ({
        type: field.type,
        capacity: field.capacity,
        pricePerHour: field.pricePerHour,
        image: field.image
      })) || []
    });
    setShowEditModal(true);
  };

  const handleUpdateAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAcademy) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Updating academy:', selectedAcademy.id, editAcademyForm);
      
      const response = await fetch(`${API_URL}/academies/${selectedAcademy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editAcademyForm)
      });

      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(`Failed to update academy: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      console.log('Academy updated:', result);
      
      alert('Academy updated successfully!');
      setShowEditModal(false);
      setSelectedAcademy(null);
      fetchAcademies(); // Refresh academies list
      fetchRecentActivities(); // Refresh recent activities
    } catch (error) {
      console.error('Update academy error:', error);
      alert(`Failed to update academy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const addFieldToEditAcademy = () => {
    setEditAcademyForm(prev => ({
      ...prev,
      fields: [...prev.fields, {
        type: '',
        capacity: 0,
        pricePerHour: 0,
        image: ''
      }]
    }));
  };

  const removeFieldFromEditAcademy = (index: number) => {
    setEditAcademyForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const updateFieldInEditAcademy = (index: number, field: any) => {
    setEditAcademyForm(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? field : f)
    }));
  };

  const addGalleryImageToEdit = (imageUrl: string) => {
    setEditAcademyForm(prev => ({
      ...prev,
      gallery: [...prev.gallery, imageUrl]
    }));
  };

  const removeGalleryImageFromEdit = (index: number) => {
    setEditAcademyForm(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  // Helper function to get field display name with academy-specific numbering
  const getFieldDisplayName = (field: any, index: number) => {
    if (userRole === 'ACADEMY_ADMIN') {
      // For academy admins, show local field number (1, 2, 3...)
      return `${field.type} #${index + 1}`;
    } else {
      // For super admins, show global field ID
      return `${field.type} #${field.id}`;
    }
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
    
    // Find the field to get its display name
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
    averageBookingsPerDay: (thisWeekBookings.length / 7).toFixed(1)
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {userRole === 'ACADEMY_ADMIN' ? 'Academy Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">{academy?.name}</p>
          {userRole === 'ACADEMY_ADMIN' && (
            <p className="text-sm text-blue-600 mt-1">Academy Admin View</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setViewMode('overview')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            viewMode === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setViewMode('academies')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            viewMode === 'academies' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Academies
        </button>
        <button
          onClick={() => setViewMode('users')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            viewMode === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Academy Admins
        </button>
      </div>

      {/* System Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Academies</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalAcademies}</p>
            </div>
            <Building className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.totalBookings}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${systemStats.totalRevenue}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Academies</p>
              <p className="text-2xl font-bold text-gray-900">{systemStats.activeAcademies}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

            {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setViewMode('academies');
                  setShowAcademyForm(true);
                }}
                className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Building className="h-6 w-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Create Academy</p>
                  <p className="text-sm text-gray-600">Add new academy with fields</p>
                </div>
              </button>
              <button 
                onClick={() => {
                  setViewMode('users');
                  setShowAcademyAdminForm(true);
                }}
                className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <UserPlus className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Create Academy Admin</p>
                  <p className="text-sm text-gray-600">Add new academy manager</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs text-gray-500">{activity.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'academies' && (
        <div className="space-y-6">
          {/* Create Academy Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Academy Management</h2>
            <button
              onClick={() => setShowAcademyForm(!showAcademyForm)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>{showAcademyForm ? 'Cancel' : 'Create Academy'}</span>
            </button>
          </div>

          {/* Create Academy Form */}
          {showAcademyForm && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Academy</h3>
              <form onSubmit={handleCreateAcademy} className="space-y-6">
                {/* Academy Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academy Name</label>
                    <input
                      type="text"
                      value={academyForm.name}
                      onChange={(e) => setAcademyForm({...academyForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
          />
        </div>
        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={academyForm.location}
                      onChange={(e) => setAcademyForm({...academyForm, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={academyForm.phone}
                      onChange={(e) => setAcademyForm({...academyForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
                    <input
                      type="text"
                      value={academyForm.openingHours}
                      onChange={(e) => setAcademyForm({...academyForm, openingHours: e.target.value})}
                      placeholder="e.g., 16:00 - 17:00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={academyForm.description}
                      onChange={(e) => setAcademyForm({...academyForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price</label>
                    <input
                      type="number"
                      value={academyForm.monthlyPrice}
                      onChange={(e) => setAcademyForm({...academyForm, monthlyPrice: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL</label>
                    <input
                      type="url"
                      value={academyForm.image}
                      onChange={(e) => setAcademyForm({...academyForm, image: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
                  <div className="space-y-2">
                    {academyForm.gallery.map((image, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => {
                            const newGallery = [...academyForm.gallery];
                            newGallery[index] = e.target.value;
                            setAcademyForm({...academyForm, gallery: newGallery});
                          }}
                          placeholder="https://example.com/gallery-image.jpg"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addGalleryImage('')}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Gallery Image</span>
                    </button>
        </div>
                </div>

                {/* Fields */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">Fields</label>
                    <button
                      type="button"
                      onClick={addFieldToAcademy}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Field</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {academyForm.fields.map((field, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">Field {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeFieldFromAcademy(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
          <input
            type="text"
                              value={field.type}
                              onChange={(e) => updateFieldInAcademy(index, {...field, type: e.target.value})}
                              placeholder="e.g., 5v5 Field, 7v7 Field"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                            <input
                              type="number"
                              value={field.capacity}
                              onChange={(e) => updateFieldInAcademy(index, {...field, capacity: Number(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour</label>
                            <input
                              type="number"
                              value={field.pricePerHour}
                              onChange={(e) => updateFieldInAcademy(index, {...field, pricePerHour: Number(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Field Image URL</label>
                            <input
                              type="url"
                              value={field.image}
                              onChange={(e) => updateFieldInAcademy(index, {...field, image: e.target.value})}
                              placeholder="https://example.com/field-image.jpg"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
        </div>
      </div>

                <div className="flex justify-end space-x-3">
        <button
                    type="button"
                    onClick={() => setShowAcademyForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
                    Cancel
        </button>
        <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
                    Create Academy
        </button>
      </div>
              </form>
            </div>
          )}

          {/* Academies List */}
      <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Academies</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Academy</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Fields</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
                  {academies.map(academy => (
                    <tr key={academy.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{academy.name}</p>
                          <p className="text-sm text-gray-600">{academy.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{academy.location}</td>
                      <td className="py-3 px-4">{academy.fields?.length || 0} fields</td>
                      <td className="py-3 px-4">{academy.phone}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewAcademy(academy)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Academy"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditAcademy(academy)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Edit Academy"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
        </div>
      </div>
      )}

      {viewMode === 'users' && (
        <div className="space-y-6">
          {/* Create Academy Admin Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Academy Admin Management</h2>
            <button
              onClick={() => setShowAcademyAdminForm(!showAcademyAdminForm)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>{showAcademyAdminForm ? 'Cancel' : 'Create Academy Admin'}</span>
            </button>
          </div>

          {/* Create Academy Admin Form */}
          {showAcademyAdminForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Academy Admin</h3>
              <form onSubmit={handleCreateAcademyAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={academyAdminForm.name}
                      onChange={(e) => setAcademyAdminForm({...academyAdminForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={academyAdminForm.email}
                      onChange={(e) => setAcademyAdminForm({...academyAdminForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={academyAdminForm.password}
                      onChange={(e) => setAcademyAdminForm({...academyAdminForm, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Academy</label>
                    <select
                      value={academyAdminForm.academyId}
                      onChange={(e) => setAcademyAdminForm({...academyAdminForm, academyId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Academy</option>
                      {academies.map(academy => (
                        <option key={academy.id} value={academy.id}>
                          {academy.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAcademyAdminForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create Academy Admin
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Academy Admins List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">All Academy Admins</h3>
              <button
                onClick={fetchAcademyAdmins}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh List
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Assigned Academy</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {academyAdmins.map(admin => (
                    <tr key={admin.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{admin.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{admin.email}</td>
                      <td className="py-3 px-4">
                        {admin.academy ? (
                          <div>
                            <p className="font-medium text-gray-900">{admin.academy.name}</p>
                            <p className="text-sm text-gray-600">{admin.academy.location}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500">No academy assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditAcademyAdmin(admin)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit Academy Admin"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAcademyAdmin(admin.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete Academy Admin"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {academyAdmins.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No academy admins found. Create one using the form above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* View Academy Modal */}
      {showViewModal && selectedAcademy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Academy Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{selectedAcademy.name}</p>
                          </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900">{selectedAcademy.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedAcademy.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{selectedAcademy.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Opening Hours</label>
                    <p className="text-gray-900">{selectedAcademy.openingHours}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monthly Price</label>
                    <p className="text-gray-900">${selectedAcademy.monthlyPrice}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fields ({selectedAcademy.fields?.length || 0})</h3>
                <div className="space-y-3">
                  {selectedAcademy.fields?.map((field, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{field.type}</p>
                          <p className="text-sm text-gray-600">Capacity: {field.capacity} players</p>
                          <p className="text-sm text-gray-600">Price: ${field.pricePerHour}/hour</p>
                        </div>
                        {field.image && (
                          <img src={field.image} alt={field.type} className="w-16 h-16 object-cover rounded" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Academy Modal */}
      {showEditModal && selectedAcademy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Edit Academy</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateAcademy} className="space-y-6">
              {/* Academy Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academy Name</label>
                  <input
                    type="text"
                    value={editAcademyForm.name}
                    onChange={(e) => setEditAcademyForm({...editAcademyForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editAcademyForm.location}
                    onChange={(e) => setEditAcademyForm({...editAcademyForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editAcademyForm.phone}
                    onChange={(e) => setEditAcademyForm({...editAcademyForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price</label>
                  <input
                    type="number"
                    value={editAcademyForm.monthlyPrice}
                    onChange={(e) => setEditAcademyForm({...editAcademyForm, monthlyPrice: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editAcademyForm.description}
                    onChange={(e) => setEditAcademyForm({...editAcademyForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={editAcademyForm.openingHours}
                    onChange={(e) => setEditAcademyForm({...editAcademyForm, openingHours: e.target.value})}
                    placeholder="e.g., Monday-Sunday: 8:00 AM - 10:00 PM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL</label>
                  <input
                    type="url"
                    value={editAcademyForm.image}
                    onChange={(e) => setEditAcademyForm({...editAcademyForm, image: e.target.value})}
                    placeholder="https://example.com/academy-image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Fields Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Fields</h3>
                  <button
                    type="button"
                    onClick={addFieldToEditAcademy}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Field</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {editAcademyForm.fields.map((field, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Field {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeFieldFromEditAcademy(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                          <input
                            type="text"
                            value={field.type}
                            onChange={(e) => updateFieldInEditAcademy(index, {...field, type: e.target.value})}
                            placeholder="e.g., 5v5, 6v6, 7v7"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                          <input
                            type="number"
                            value={field.capacity}
                            onChange={(e) => updateFieldInEditAcademy(index, {...field, capacity: Number(e.target.value)})}
                            placeholder="10"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour</label>
                          <input
                            type="number"
                            value={field.pricePerHour}
                            onChange={(e) => updateFieldInEditAcademy(index, {...field, pricePerHour: Number(e.target.value)})}
                            placeholder="50"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Field Image URL</label>
                          <input
                            type="url"
                            value={field.image}
                            onChange={(e) => updateFieldInEditAcademy(index, {...field, image: e.target.value})}
                            placeholder="https://example.com/field-image.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Gallery Images</h3>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      placeholder="Add image URL"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            addGalleryImageToEdit(input.value.trim());
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add image URL"]') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          addGalleryImageToEdit(input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {editAcademyForm.gallery.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img src={imageUrl} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImageFromEdit(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Academy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Academy Admin Modal */}
      {showEditAcademyAdminModal && editingAcademyAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Academy Admin</h3>
              <button
                onClick={() => {
                  setShowEditAcademyAdminModal(false);
                  setEditingAcademyAdmin(null);
                  setEditAcademyAdminForm({ email: '', password: '', name: '', academyId: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateAcademyAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editAcademyAdminForm.name}
                  onChange={(e) => setEditAcademyAdminForm({...editAcademyAdminForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editAcademyAdminForm.email}
                  onChange={(e) => setEditAcademyAdminForm({...editAcademyAdminForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editAcademyAdminForm.password}
                  onChange={(e) => setEditAcademyAdminForm({...editAcademyAdminForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password or leave blank"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Academy</label>
                <select
                  value={editAcademyAdminForm.academyId}
                  onChange={(e) => setEditAcademyAdminForm({...editAcademyAdminForm, academyId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Academy</option>
                  {academies.map(academy => (
                    <option key={academy.id} value={academy.id}>
                      {academy.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditAcademyAdminModal(false);
                    setEditingAcademyAdmin(null);
                    setEditAcademyAdminForm({ email: '', password: '', name: '', academyId: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Academy Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};