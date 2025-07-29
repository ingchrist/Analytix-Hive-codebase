# Analytix Hive LMS - Authentication Setup Guide

This guide covers the complete setup and configuration of the aligned frontend and backend authentication system.

## 🏗️ Architecture Overview

### Backend (Django)
- **Framework**: Django 4.2.7 with Django REST Framework
- **Authentication**: Custom authentication views with Django Allauth integration
- **Token System**: Django REST Framework Token Authentication
- **User Model**: Custom User model with email as primary identifier
- **Email Verification**: Django Allauth email verification system

### Frontend (Next.js)
- **Framework**: Next.js 15 with TypeScript
- **State Management**: React Context API with custom AuthContext
- **API Client**: Axios with interceptors for token management
- **Validation**: Zod schemas for form validation
- **UI**: Tailwind CSS with shadcn/ui components

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL (optional, SQLite works for development)
- Redis (for Celery and Channels)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend-codes
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Database migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend-codes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration Details

### Backend Configuration

#### Environment Variables (.env)
```env
# Django Core
SECRET_KEY=your-super-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database
DATABASE_URL=sqlite:///db.sqlite3

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Email (for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

#### Key Settings (settings/base.py)
- Custom User Model: `AUTH_USER_MODEL = 'users.User'`
- Authentication: Token + Session authentication
- Email verification: Mandatory (configurable)
- CORS: Configured for localhost:3000

### Frontend Configuration

#### Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Key Components
- **AuthContext**: Manages global authentication state
- **API Client**: Handles requests with automatic token injection
- **Route Protection**: Automatic redirects for protected routes

## 📡 API Endpoints

### Authentication Endpoints
```
POST /api/auth/registration/     - User registration
POST /api/auth/login/           - User login
POST /api/auth/logout/          - User logout
POST /api/auth/registration/verify-email/  - Email verification
POST /api/auth/registration/resend-email/  - Resend verification
```

### User Endpoints
```
GET  /api/users/me/             - Get current user profile
PATCH /api/users/me/update/     - Update user profile
```

## 🔐 Authentication Flow

### Registration Flow
1. User submits registration form (first_name, last_name, email, password)
2. Backend creates user account (inactive by default)
3. Verification email sent to user
4. User clicks verification link
5. Account activated and token generated
6. User redirected to dashboard

### Login Flow
1. User submits login credentials (email, password)
2. Backend validates credentials
3. Token generated and returned with user data
4. Frontend stores token and user data
5. User redirected to appropriate dashboard

### Token Management
- Tokens stored in localStorage
- Automatic injection in API requests
- Token validation on app initialization
- Automatic logout on token expiration

## 🛡️ Security Features

### Backend Security
- CSRF protection enabled
- CORS properly configured
- Email verification required
- Password validation
- Rate limiting (configurable)
- Secure token generation

### Frontend Security
- Token stored securely
- Automatic token cleanup on logout
- Protected route guards
- Input validation with Zod
- XSS protection through React

## 🎨 Form Validation

### Registration Form
- First Name: Required, 2-30 characters
- Last Name: Required, 2-30 characters
- Email: Required, valid email format
- Password: 8+ characters, must contain letter, number, and special character

### Login Form
- Email: Required, valid email format
- Password: Required, minimum 8 characters

## 🚀 User Types and Redirects

After successful authentication, users are redirected based on their type:
- **Student**: `/student/dashboard` ✅ **Available**
- **Instructor**: `/student/dashboard` ⚠️ **Temporary redirect** (Instructor dashboard coming soon)
- **Admin**: `/student/dashboard` ⚠️ **Temporary redirect** (Admin dashboard coming soon)

**Current Flow:**
1. **Signup** → `/auth?message=verification-sent` (email verification required)
2. **Login** → All users redirected to `/student/dashboard`
3. **User Experience:** 
   - Students: Full access to student dashboard
   - Instructors/Admins: Can access student features temporarily with informational messages
   - User type indicators show account type and development status

## 🔄 State Management

### AuthContext Provider
```typescript
interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  user_type: 'student' | 'instructor' | 'admin'
  // ... other fields
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}
```

## 🧪 Testing

### Backend Testing
```bash
# Run tests
python manage.py test

# Test specific app
python manage.py test apps.users
```

### Frontend Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## 📦 Production Deployment

### Backend Production Settings
1. Set `DEBUG=False`
2. Configure proper database (PostgreSQL recommended)
3. Set up email backend (SMTP)
4. Configure static files serving
5. Set secure secret key
6. Enable HTTPS

### Frontend Production Settings
1. Set production API URL
2. Configure proper error handling
3. Optimize bundle size
4. Enable service worker (optional)

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure backend CORS settings include frontend URL
- Check that requests include proper headers

#### Token Issues
- Verify token is being stored properly
- Check token format in requests (Token prefix)
- Ensure token hasn't expired

#### Email Verification
- Check email backend configuration
- Verify SMTP settings in production
- Check spam folder for verification emails

#### Database Issues
- Run migrations: `python manage.py migrate`
- Check database connectivity
- Verify user model configuration

## 🔧 Development Tips

### Backend Development
- Use Django admin for user management
- Check logs for authentication errors
- Use Django shell for testing user operations

### Frontend Development
- Use React DevTools for state debugging
- Check Network tab for API requests
- Use console for authentication flow debugging

## 📝 API Usage Examples

### Registration
```javascript
const registerUser = async (userData) => {
  const response = await fetch('/api/auth/registration/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      password1: userData.password,
      password2: userData.password,
    })
  })
  return response.json()
}
```

### Login
```javascript
const loginUser = async (credentials) => {
  const response = await fetch('/api/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  })
  return response.json()
}
```

### Authenticated Request
```javascript
const getUserProfile = async (token) => {
  const response = await fetch('/api/users/me/', {
    headers: { 
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    }
  })
  return response.json()
}
```

## 🤝 Contributing

1. Follow the established patterns for authentication
2. Ensure all forms use proper validation
3. Add proper error handling
4. Update tests when adding new features
5. Follow security best practices

## 📞 Support

For issues or questions regarding the authentication system:
1. Check this documentation
2. Review the troubleshooting section
3. Check existing issues in the repository
4. Create a new issue with detailed information

---

## ✅ Verification Checklist

After setup, verify the following works:
- [ ] User registration with email verification
- [ ] User login with proper token generation
- [ ] Protected routes redirect correctly
- [ ] User logout clears authentication state
- [ ] Token persistence across browser sessions
- [ ] API requests include authentication headers
- [ ] Error handling displays proper messages
- [ ] Form validation works on both client and server
- [ ] User profile updates work correctly
- [ ] Email verification flow completes successfully

The authentication system is now fully aligned between frontend and backend, providing a secure and user-friendly experience.
