import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { google } from 'googleapis';
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

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('JWT_SECRET not found in environment variables');
}
const PORT = process.env.PORT || 4000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  },
});

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://foot-booking.vercel.app',
    'https://foot-booking-esbfq20a8-hokzs-projects.vercel.app',
    'https://foot-booking-gv4nhcrs1-hokzs-projects.vercel.app',
    'https://foot-booking-p7vr4zbgk-hokzs-projects.vercel.app'
  ],
  credentials: true
}));

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

// Auth middleware
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  
  if (!auth) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  
  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET || 'supersecret') as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Specific role middleware
const requireAdmin = requireRole(['ADMIN']);
const requireAcademyAdmin = requireRole(['ADMIN', 'ACADEMY_ADMIN']);
const requireUser = requireRole(['ADMIN', 'ACADEMY_ADMIN', 'USER']);



app.post('/api/submit-play', upload.single('video'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (req.file.size > maxSize) {
      res.status(400).json({ 
        error: 'File too large', 
        details: `File size ${(req.file.size / 1024 / 1024).toFixed(1)}MB exceeds 50MB limit` 
      });
      return;
    }

    if (!req.file.mimetype.startsWith('video/')) {
      res.status(400).json({ 
        error: 'Invalid file type', 
        details: 'Only video files are allowed' 
      });
      return;
    }

    const { playerName, email, date } = req.body;

    try {
      const filename = `${playerName || 'Player'}-${new Date().toISOString().split('T')[0]}.mp4`;
      
      const fileMetadata = {
        name: filename,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ''],
        supportsAllDrives: true
      };

      const { Readable } = require('stream');
      const stream = new Readable();
      stream.push(req.file.buffer);
      stream.push(null);

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType: 'video/mp4',
          body: stream
        },
        fields: 'id, name, webViewLink',
        supportsAllDrives: true
      });

      if (!response.data?.id) {
        throw new Error('Failed to upload to Google Drive');
      }

      res.json({
        success: true,
        message: 'Play submitted successfully! We will review your video and get back to you.',
        fileName: filename,
        fileSize: req.file.size,
        driveLink: response.data.webViewLink
      });

    } catch (driveError: any) {
      console.error('Google Drive upload error:', driveError.message);
      
      res.json({
        success: true,
        message: 'Play submitted successfully (Google Drive upload failed)',
        fileName: req.file.originalname,
        fileSize: req.file.size,
        note: 'File saved locally - Google Drive upload will be retried later'
      });
    }

  } catch (error) {
    console.error('Submit play error:', error);
    res.status(500).json({ 
      error: 'Failed to submit play',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});



app.use(express.json());

// Health check endpoint
app.get('/', (req: Request, res: Response): void => {
  res.json({ 
    message: 'FootBooking API is running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/health', (req: Request, res: Response): void => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Get all academies with their fields
app.get('/academies', async (req: Request, res: Response): Promise<void> => {
  try {
    const academies = await prisma.academy.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        phone: true,
        description: true,
        rating: true,
        image: true,
        openingHours: true,
        monthlyPrice: true,
        gallery: true,
        fields: true
      }
    });
    res.json(academies);
  } catch (error) {
    console.error('Error fetching academies:', error);
    res.status(500).json({ error: 'Failed to fetch academies', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get all fields
app.get('/fields', async (req: Request, res: Response): Promise<void> => {
  try {
    const fields = await prisma.field.findMany({
      include: { academy: true }
    });
    res.json(fields);
  } catch {
    res.status(500).json({ error: 'Failed to fetch fields' });
  }
});

// Update academy with fields (PUT route must come before GET route)
app.put('/academies/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('PUT /academies/:id endpoint called');
    const { id } = req.params;
    const { name, location, phone, description, openingHours, monthlyPrice, image, gallery, fields } = req.body;
    
    console.log('Updating academy:', id, req.body);
    
    if (!name || !location || !phone || !description || !openingHours || !monthlyPrice || !image) {
      console.log('Missing required fields:', { name, location, phone, description, openingHours, monthlyPrice, image });
      res.status(400).json({ error: 'Missing required academy fields' });
      return;
    }
    
    // Update academy
    const updatedAcademy = await prisma.academy.update({
      where: { id: Number(id) },
      data: {
        name,
        location,
        phone,
        description,
        openingHours,
        monthlyPrice: Number(monthlyPrice),
        image,
        gallery: gallery || [],
      }
    });
    
    console.log('Academy updated:', updatedAcademy);
    
    // Delete existing fields for this academy
    await prisma.field.deleteMany({
      where: { academyId: Number(id) }
    });
    
    // Create new fields for the academy
    if (fields && fields.length > 0) {
      for (const field of fields) {
        await prisma.field.create({
          data: {
            type: field.type,
            capacity: Number(field.capacity),
            pricePerHour: Number(field.pricePerHour),
            image: field.image,
            academyId: Number(id)
          }
        });
      }
    }
    
    // Return the updated academy with fields
    const academyWithFields = await prisma.academy.findUnique({
      where: { id: Number(id) },
      include: { fields: true }
    });
    
    console.log('Academy with fields:', academyWithFields);
    res.json(academyWithFields);
  } catch (error) {
    console.error('Error updating academy:', error);
    res.status(500).json({ error: 'Failed to update academy', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get academy by ID
app.get('/academies/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const academy = await prisma.academy.findUnique({
      where: { id: Number(id) },
      include: { fields: true }
    });
    
    if (!academy) {
      res.status(404).json({ error: 'Academy not found' });
      return;
    }
    
    res.json(academy);
  } catch {
    res.status(500).json({ error: 'Failed to fetch academy' });
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

// Get bookings for a specific academy
app.get('/academies/:academyId/bookings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { academyId } = req.params;
    
    // First get all fields for this academy
    const academyFields = await prisma.field.findMany({
      where: { academyId: Number(academyId) },
      select: { id: true }
    });
    
    const fieldIds = academyFields.map(field => field.id);
    
    // Then get all bookings for these fields
    const bookings = await prisma.booking.findMany({
      where: {
        fieldId: { in: fieldIds }
      },
      include: { field: true }
    });
    
    res.json(bookings);
  } catch {
    res.status(500).json({ error: 'Failed to fetch academy bookings' });
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

// Delete a booking (cancel booking)
app.delete('/bookings/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if booking exists
    const booking = await prisma.booking.findUnique({ 
      where: { id: Number(id) }
    });
    
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    
    // Delete the booking
    await prisma.booking.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

function toDateOnly(dateString: string): Date {
  const d = new Date(dateString);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

app.post('/bookings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fieldId, date, time, customerName, customerPhone, customerEmail } = req.body;
    
    if (!fieldId || !date || !time || !customerName || !customerPhone || !customerEmail) {
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
      JWT_SECRET || 'supersecret', 
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
      include: { academy: { include: { fields: true } } }
    });

    if (!user || !user.academy) {
      res.status(404).json({ error: 'Academy not found for this user' });
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

// Create academy admin user
app.post('/api/admin/academy-admins', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, academyId } = req.body;
    
    if (!email || !password || !name || !academyId) {
      res.status(400).json({ error: 'Email, password, name, and academyId required' });
      return;
    }
    
    // Check if academy exists
    const academy = await prisma.academy.findUnique({
      where: { id: Number(academyId) }
    });
    
    if (!academy) {
      res.status(404).json({ error: 'Academy not found' });
      return;
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name,
        role: 'ACADEMY_ADMIN',
        academyId: Number(academyId)
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
    res.status(500).json({ error: 'Failed to create academy admin' });
  }
});

// Get all academy admins
app.get('/api/admin/academy-admins', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('Fetching academy admins for user:', req.user);
    
    const academyAdmins = await prisma.user.findMany({
      where: { role: 'ACADEMY_ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        academy: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        createdAt: true
      }
    });
    
    console.log('Found academy admins:', academyAdmins.length);
    res.json(academyAdmins);
  } catch (error) {
    console.error('Error fetching academy admins:', error);
    res.status(500).json({ error: 'Failed to fetch academy admins' });
  }
});

// Update academy admin
app.put('/api/admin/academy-admins/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, name, academyId, password } = req.body;
    
    if (!email || !name || !academyId) {
      res.status(400).json({ error: 'Email, name, and academyId required' });
      return;
    }
    
    // Check if academy exists
    const academy = await prisma.academy.findUnique({
      where: { id: Number(academyId) }
    });
    
    if (!academy) {
      res.status(404).json({ error: 'Academy not found' });
      return;
    }
    
    // Check if email already exists for another user
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        id: { not: Number(id) }
      }
    });
    
    if (existingUser) {
      res.status(409).json({ error: 'Email already in use by another user' });
      return;
    }
    
    // Prepare update data
    const updateData: any = {
      email,
      name,
      academyId: Number(academyId)
    };
    
    // Only update password if provided
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updateData.password = hash;
    }
    
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
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
    res.status(500).json({ error: 'Failed to update academy admin' });
  }
});

// Delete academy admin
app.delete('/api/admin/academy-admins/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if user exists and is an academy admin
    const user = await prisma.user.findUnique({
      where: { id: Number(id) }
    });
    
    if (!user) {
      res.status(404).json({ error: 'Academy admin not found' });
      return;
    }
    
    if (user.role !== 'ACADEMY_ADMIN') {
      res.status(400).json({ error: 'User is not an academy admin' });
      return;
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'Academy admin deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete academy admin' });
  }
});

// Create academy with fields
app.post('/academies', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {

    
    const { name, location, phone, description, openingHours, monthlyPrice, image, gallery, fields } = req.body;
    
    // Check for required fields and provide specific error messages
    const missingFields = [];
    if (!name || name.trim() === '') missingFields.push('name');
    if (!location || location.trim() === '') missingFields.push('location');
    if (!phone || phone.trim() === '') missingFields.push('phone');
    if (!description || description.trim() === '') missingFields.push('description');
    if (!openingHours || openingHours.trim() === '') missingFields.push('openingHours');
    if (!monthlyPrice || monthlyPrice === 0 || monthlyPrice <= 0) missingFields.push('monthlyPrice');
    if (!image || image.trim() === '') missingFields.push('image');
    
    if (missingFields.length > 0) {
      res.status(400).json({ 
        error: 'Missing required academy fields', 
        missingFields: missingFields
      });
      return;
    }
    
    // Create academy
    const academy = await prisma.academy.create({
      data: {
        name,
        location,
        phone,
        description,
        openingHours,
        monthlyPrice: Number(monthlyPrice),
        image,
        gallery: gallery || [],
        rating: 4.5, // Default rating
      }
    });
    
    // Create fields for the academy
    if (fields && fields.length > 0) {
      for (const field of fields) {
        await prisma.field.create({
          data: {
            type: field.type,
            capacity: Number(field.capacity),
            pricePerHour: Number(field.pricePerHour),
            image: field.image,
            academyId: academy.id
          }
        });
      }
    }
    
    // Return the created academy with fields
    const academyWithFields = await prisma.academy.findUnique({
      where: { id: academy.id },
      include: { fields: true }
    });
    
    res.json(academyWithFields);
  } catch (error) {
    console.error('Error creating academy:', error);
    res.status(500).json({ error: 'Failed to create academy', details: error instanceof Error ? error.message : 'Unknown error' });
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