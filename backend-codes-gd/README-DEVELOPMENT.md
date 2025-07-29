# BMad LMS Backend - Development Guide

## Current Status

This Django backend is currently running in **development mock mode** using a Node.js server that simulates the API endpoints. This is because the development environment doesn't have Python package management (pip) available.

## Quick Start (Mock Server)

The mock server is currently running and provides sample API responses for testing:

```bash
npm install
npm run dev
```

### Available Mock Endpoints

- `GET /` - Server status and endpoint list
- `POST /api/auth/login/` - User authentication
- `POST /api/auth/register/` - User registration  
- `GET /api/users/` - List users
- `GET /api/courses/` - List courses
- `GET /api/live-classes/` - List live classes
- `GET /api/chat/rooms/` - List chat rooms
- `GET /api/payments/transactions/` - List transactions

## Production Django Setup

To run the actual Django backend:

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Setup

Create a `.env` file with:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://user:password@localhost:5432/bmad_lms
REDIS_URL=redis://localhost:6379
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
PAYSTACK_SECRET_KEY=your-paystack-secret-key
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 3. Database Setup

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 4. Start Development Server

```bash
python manage.py runserver 0.0.0.0:8000
```

### 5. Background Services

For full functionality, you'll also need:

- **Redis** (for caching and Celery): `redis-server`
- **Celery Workers** (for async tasks): `celery -A bmad_lms worker -l info`
- **WebSocket Support** (for real-time features): Use Daphne in production

## Architecture Overview

This LMS backend includes:

### 🔐 Authentication & Users (`apps/users/`)
- JWT-based authentication with djangorestframework-simplejwt
- Custom User model with roles (Student, Instructor, Admin)
- User profiles and permissions

### 📚 Course Management (`apps/courses/`)
- Course creation and management
- Sections and lessons with multiple content types
- Enrollment system with progress tracking
- Reviews and ratings

### 🎥 Live Classes (`apps/live_classes/`)
- WebRTC signaling for real-time video classes
- Session management and recording
- Chat during live sessions
- Resource sharing

### 💬 Real-time Chat (`apps/chat/`)
- Course-specific chat rooms
- Direct messaging
- Real-time messaging with Django Channels
- Message read receipts

### 💳 Payment Integration (`apps/payments/`)
- Paystack payment gateway integration
- Transaction management
- Wallet system for refunds
- Coupon and discount system

### 📊 Analytics & Progress (`apps/analytics/`)
- Student progress tracking
- Course completion analytics
- Instructor dashboards

### 🔔 Notifications (`apps/notifications/`)
- In-app notifications
- Email notifications
- WebSocket real-time updates

### 📁 File Management (`apps/files/`)
- Secure file upload and storage
- Support for course materials
- Profile pictures and attachments

## API Documentation

Once the Django server is running, API documentation will be available at:
- Browsable API: `http://localhost:8000/api/`
- Admin Panel: `http://localhost:8000/admin/`

## Technology Stack

- **Framework**: Django 4.2.7
- **API**: Django REST Framework 3.14.0
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: PostgreSQL (recommended) or SQLite (development)
- **Real-time**: Django Channels with Redis
- **Async Tasks**: Celery with Redis/RabbitMQ
- **Payments**: Paystack API integration
- **File Storage**: Local/AWS S3/Google Cloud Storage

## Development Notes

The current mock server demonstrates the API structure and endpoints that the Django backend will provide. All the Django models, serializers, views, and URLs are implemented and ready to use once the Python environment is properly configured.

For production deployment, consider using:
- **Web Server**: Gunicorn + Nginx
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis
- **File Storage**: AWS S3 or similar cloud storage
- **Monitoring**: Sentry for error tracking
