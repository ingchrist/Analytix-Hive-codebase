
# Architecture Document for Analytix Hive LMS Backend

## 1. Overview

This document describes the architecture for the backend of the Analytix Hive Learning Management System (LMS). The backend will be a monolithic application built with the Django framework, following a Model-View-Template (MVT) pattern. It will expose a RESTful API for the frontend application.

## 2. Technology Stack

*   **Framework:** Django
*   **Database:** PostgreSQL
*   **Authentication:** Django Allauth for email/password and Google OAuth2
*   **API:** Django REST Framework (DRF)

## 3. Project Structure

The project will be structured as follows:

```
backend-codes/
├───manage.py
├───authentication/
│   ├───__init__.py
│   ├───admin.py
│   ├───apps.py
│   ├───models.py
│   ├───serializers.py
│   ├───urls.py
│   ├───views.py
│   └───migrations/
└───hives_africa_lms/
    ├───__init__.py
    ├───asgi.py
    ├───settings.py
    ├───urls.py
    └───wsgi.py
```

*   **authentication:** A Django app to handle all user authentication logic.
*   **hives_africa_lms:** The main Django project.

## 4. Database Schema

The initial database schema will consist of the default Django `User` model, extended with a `Profile` model to store additional user information.

*   **User Model:** (Django's built-in `django.contrib.auth.models.User`)
    *   `username`
    *   `password`
    *   `email`
    *   `first_name`
    *   `last_name`
    *   `is_active`
*   **Profile Model:**
    *   `user` (OneToOneField to User)
    *   `email_confirmed` (BooleanField)

## 5. API Design

The API will be designed using the Django REST Framework. It will be versioned and will use JSON for serialization.

### 5.1. Authentication Endpoints

*   **`POST /api/auth/register/`**
    *   **Request:** `{"first_name": "...", "last_name": "...", "email": "...", "password": "..."}`
    *   **Response:** `{"detail": "Confirmation email sent."}`
*   **`POST /api/auth/login/`**
    *   **Request:** `{"email": "...", "password": "..."}`
    *   **Response:** `{"key": "..."}` (authentication token)
*   **`GET /api/auth/confirm-email/<uidb64>/<token>/`**
    *   **Response:** Redirect to login page.

## 6. Implementation Details

*   **Django Allauth:** This library will be used to handle the complexities of email confirmation and Google OAuth2.
*   **Custom User Model:** A custom user model will not be necessary for the initial implementation. The built-in `User` model will be sufficient.
*   **Email Backend:** Django's email backend will be configured to send emails through a service like SendGrid or Mailgun.
