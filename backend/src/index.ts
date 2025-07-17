import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import emailService from './emailService';

interface JwtPayload {
  userId: number;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

dotenv.config();
const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://foot-booking.vercel.app',
    'https://foot-booking-esbfq20a8-hokzs-projects.vercel.app',
    'https://foot-booking-gv4nhcrs1-hokzs-projects.vercel.app',
    'https://foot-booking-p7vr4zbgk-hokzs-projects.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

app.get('/', (req: Request, res: Response): void => {
  res.send('API is running');
});

// Get all academies with their fields
app.get('/academies', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching academies...');
    const academies = await prisma.academy.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        phone: true,
        description: true,
        rating: true,
        image: true,
        fields: true
      }
    });
    console.log('Academies found:', academies.length);
    res.json(academies);
  } catch (error) {
    console.error('Error fetching academies:', error);
    res.status(500).json({ error: 'Failed to fetch academies', details: error.message });
  }
});

// Get all fields
app.get('/fields', async (req: Request, res: Response): Promise<void> => {
  try {
    const fields = await prisma.field.findMany();
    res.json(fields);
  } catch {
    res.status(500).json({ error: 'Failed to fetch fields' });
  }
});

// Get all bookings
app.get('/bookings', async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { field: true }
    });
    res.json(bookings);
  } catch {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get a booking by ID
app.get('/bookings/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ 
      where: { id: Number(id) },
      include: { field: true }
    });
    
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    
    res.json(booking);
  } catch {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

function toDateOnly(dateString: string): Date {
  const d = new Date(dateString);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

app.post('/bookings', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received booking request:', req.body);
    const { fieldId, date, time, customerName, customerPhone, customerEmail } = req.body;
    
    if (!fieldId || !date || !time || !customerName || !customerPhone || !customerEmail) {
      console.log('Missing fields:', { fieldId, date, time, customerName, customerPhone, customerEmail });
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    // Rate limit: max 1 booking per phone number per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysBookings = await prisma.booking.findMany({
      where: {
        customerPhone,
        createdAt: { 
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    if (todaysBookings.length >= 1) {
      res.status(429).json({ 
        error: 'You can only book one game per day. Please try again tomorrow.' 
      });
      return;
    }
    
    const dateOnly = toDateOnly(date);
    
    // Check for existing booking
    const existing = await prisma.booking.findFirst({
      where: { fieldId, date: dateOnly, time }
    });
    
    if (existing) {
      res.status(409).json({ error: 'This slot is already booked' });
      return;
    }
    
    const booking = await prisma.booking.create({
      data: {
        fieldId,
        date: dateOnly,
        time,
        customerName,
        customerPhone,
        customerEmail
      },
      include: { field: true }
    });
    
    res.status(201).json(booking);
  } catch {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get availability for a specific field on a specific date
app.get('/fields/:fieldId/availability', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fieldId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      res.status(400).json({ error: 'Missing date query parameter' });
      return;
    }
    
    const bookings = await prisma.booking.findMany({
      where: {
        fieldId: Number(fieldId),
        date: new Date(date as string)
      },
      select: { time: true }
    });
    
    const bookedTimes = bookings.map(booking => booking.time);
    res.json({ bookedTimes });
  } catch {
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Register endpoint (public, only 'user' role)
app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role = 'USER' } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    
    // Validate role
    const validRoles = ['USER', 'ACADEMY_ADMIN', 'ADMIN'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, name, role: role as 'USER' | 'ACADEMY_ADMIN' | 'ADMIN' }
    });
    
    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    });
  } catch {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch {
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Role-based middleware functions
function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    
    next();
  };
}

// Specific role middleware
const requireAdmin = requireRole(['ADMIN']);
const requireAcademyAdmin = requireRole(['ADMIN', 'ACADEMY_ADMIN']);
const requireUser = requireRole(['ADMIN', 'ACADEMY_ADMIN', 'USER']);

// Auth middleware
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  
  if (!auth) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  
  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get current user (me)
app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.userId },
      include: { academy: true }
    });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role,
      academy: user.academy
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Super Admin endpoints
app.get('/api/admin/users', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        academy: {
          select: { id: true, name: true }
        }
      }
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin endpoints
app.get('/api/admin/academies', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const academies = await prisma.academy.findMany({
      include: {
        admin: {
          select: { id: true, email: true, name: true }
        },
        fields: true
      }
    });
    res.json(academies);
  } catch {
    res.status(500).json({ error: 'Failed to fetch academies' });
  }
});

// Academy Admin endpoints
app.get('/api/academy/my-academy', requireAuth, requireAcademyAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { academy: true }
    });
    
    if (!user?.academy) {
      res.status(404).json({ error: 'No academy associated with this user' });
      return;
    }
    
    res.json(user.academy);
  } catch {
    res.status(500).json({ error: 'Failed to fetch academy' });
  }
});

// User endpoints
app.get('/api/user/my-bookings', requireAuth, requireUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      include: { field: { include: { academy: true } } }
    });
    
    res.json(bookings);
  } catch {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Role management endpoints (Super Admin only)
app.put('/api/admin/users/:id/role', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['USER', 'ACADEMY_ADMIN', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }
    
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role: role as 'USER' | 'ACADEMY_ADMIN' | 'ADMIN' }
    });
    
    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    });
  } catch {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Assign academy to academy admin
app.put('/api/admin/users/:id/academy', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { academyId } = req.body;
    
    if (!academyId) {
      res.status(400).json({ error: 'Academy ID required' });
      return;
    }
    
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { 
        academyId: Number(academyId),
        role: 'ACADEMY_ADMIN'
      },
      include: { academy: true }
    });
    
    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role,
      academy: user.academy
    });
  } catch {
    res.status(500).json({ error: 'Failed to assign academy' });
  }
});

// Test email service endpoint
app.post('/test-email', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Testing email service configuration...');
    
    // Test the email service directly
    const testBookingDetails = {
      bookingId: 999,
      fieldName: 'Test Field',
      fieldId: 1,
      date: 'Test Date',
      time: 'Test Time',
      customerName: 'Test User',
      customerPhone: '+1234567890',
      customerEmail: 'test@example.com',
      academyName: 'Test Academy'
    };
    
    const emailSent = await emailService.sendBookingConfirmation(testBookingDetails);
    
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Email service test successful',
        details: 'Email configuration is working correctly'
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Email service test failed',
        details: 'Check the server logs for more details'
      });
    }
  } catch (error) {
    console.error('Email service test error:', error);
    res.status(500).json({ error: 'Email service test failed' });
  }
});

// Send email confirmation endpoint
app.post('/send-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, bookingDetails } = req.body;
    
    if (!email || !bookingDetails) {
      res.status(400).json({ error: 'Email and booking details required' });
      return;
    }
    
    // Send email using MailerSend
    const emailSent = await emailService.sendBookingConfirmation(bookingDetails);
    
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Email sent successfully via MailerSend',
        to: email,
        bookingDetails
      });
    } else {
      // Email failed but booking was created successfully
      res.json({ 
        success: false, 
        message: 'Booking created successfully but email could not be sent. Please check your email settings.',
        to: email,
        bookingDetails,
        warning: 'Email service temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 