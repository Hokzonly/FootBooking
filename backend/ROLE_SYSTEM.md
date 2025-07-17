# Role-Based Access Control System

## User Roles Hierarchy

### 1. ADMIN (Highest Level)
- **Permissions**: Full system access
- **Can do**: 
  - Manage all users
  - Manage all academies
  - Assign academy admins
  - View all data
- **Endpoints**: `/api/admin/users`, `/api/admin/academies`, `/api/admin/users/:id/role`
- **Use case**: System administrators, platform managers

### 2. ACADEMY_ADMIN (Medium Level)
- **Permissions**: Manage their specific academy
- **Can do**:
  - View their academy details
  - Manage their academy's fields
  - View bookings for their academy
- **Endpoints**: `/api/academy/my-academy`
- **Use case**: Academy owners/managers

### 3. USER (Basic Level)
- **Permissions**: Basic booking functionality
- **Can do**:
  - Book fields
  - View their own bookings
  - Update their profile
- **Endpoints**: `/api/user/my-bookings`
- **Use case**: Regular customers

## API Endpoints by Role

### Admin Endpoints
```
GET /api/admin/users - List all users
PUT /api/admin/users/:id/role - Update user role
GET /api/admin/academies - List all academies
PUT /api/admin/users/:id/academy - Assign academy to user
```

### Academy Admin Endpoints
```
GET /api/academy/my-academy - Get academy details
```

### User Endpoints
```
GET /api/user/my-bookings - Get user's bookings
```

## How to Use

### 1. Register a User with Role
```javascript
// Register a regular user
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    role: 'USER' // Default role
  })
});

// Register an academy admin
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@academy.com',
    password: 'password123',
    name: 'Academy Manager',
    role: 'ACADEMY_ADMIN'
  })
});

// Register a system admin
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@platform.com',
    password: 'password123',
    name: 'System Admin',
    role: 'ADMIN'
  })
});
```

### 2. Login and Get User Info
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token, user } = await response.json();
console.log('User role:', user.role); // 'USER', 'ACADEMY_ADMIN', 'ADMIN'
```

### 3. Check User Role in Frontend
```javascript
// After login, store user info
const user = {
  id: 1,
  email: 'user@example.com',
  name: 'John Doe',
  role: 'ACADEMY_ADMIN'
};

// Check permissions
if (user.role === 'ADMIN') {
  // Show admin features
} else if (user.role === 'ACADEMY_ADMIN') {
  // Show academy admin features
} else {
  // Show regular user features
}
```

### 4. Update User Role (Admin Only)
```javascript
fetch(`/api/admin/users/${userId}/role`, {
  method: 'PUT',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    role: 'ACADEMY_ADMIN'
  })
});
```

### 5. Assign Academy to Academy Admin
```javascript
fetch(`/api/admin/users/${userId}/academy`, {
  method: 'PUT',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    academyId: 1
  })
});
```

## Frontend Role-Based UI

### Example React Component
```jsx
const Dashboard = () => {
  const { user } = useAuth(); // Your auth context

  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  } else if (user.role === 'ACADEMY_ADMIN') {
    return <AcademyAdminDashboard />;
  } else {
    return <UserDashboard />;
  }
};
```

### Navigation Based on Role
```jsx
const Navigation = () => {
  const { user } = useAuth();

  return (
    <nav>
      <Link to="/">Home</Link>
      
      {user.role === 'ADMIN' && (
        <>
          <Link to="/admin/users">Manage Users</Link>
          <Link to="/admin/academies">Manage Academies</Link>
        </>
      )}
      
      {user.role === 'ACADEMY_ADMIN' && (
        <>
          <Link to="/academy/dashboard">Academy Dashboard</Link>
        </>
      )}
      
      <Link to="/bookings">My Bookings</Link>
    </nav>
  );
};
```

## Database Migration

After updating the schema, run:
```bash
npx prisma migrate dev --name simplify_user_roles
npx prisma generate
```

## Security Notes

1. **Always verify roles on the backend** - Frontend role checks are for UI only
2. **Use middleware** - The `requireRole` middleware ensures proper access control
3. **Validate input** - Always validate role assignments
4. **Log role changes** - Consider logging role modifications for audit trails 