
# Product Requirements Document (PRD) for Analytix Hive LMS Backend

## 1. Overview

This document outlines the product requirements for the backend of the Analytix Hive Learning Management System (LMS). The backend will be built with Django and will provide the necessary APIs to support the existing frontend application.

## 2. User Flow

The primary user flow to be implemented is as follows:

1.  **User Registration:** A new user creates an account using their first name, last name, email address, and password.
2.  **Email Confirmation:** After registration, the user receives an email with a confirmation link.
3.  **User Login:** The user logs in with their email and password.
4.  **Dashboard Access:** Upon successful login, the user is redirected to their dashboard.

## 3. Functional Requirements

### 3.1. User Authentication

*   **Email/Password Authentication:**
    *   Users must be able to register for a new account.
    *   Users must be able to log in with their email and password.
    *   Users must be able to log out.
*   **Google OAuth2 Authentication:**
    *   Users must be able to register and log in using their Google account.
*   **Email Confirmation:**
    *   A confirmation email with a unique link must be sent to the user's email address upon registration.
    *   The user's account should be marked as inactive until the email is confirmed.
    *   The confirmation link should redirect the user to the login page upon successful confirmation.
*   **Password Reset:**
    *   Users should be able to request a password reset link to be sent to their email address.

### 3.2. API Endpoints

The following API endpoints will be created:

*   `POST /api/auth/register/`: User registration.
*   `POST /api/auth/login/`: User login.
*   `POST /api/auth/logout/`: User logout.
*   `GET /api/auth/confirm-email/<uidb64>/<token>/`: Email confirmation.
*   `POST /api/auth/password-reset/`: Request password reset.
*   `POST /api/auth/password-reset-confirm/<uidb64>/<token>/`: Confirm password reset.
*   `POST /api/auth/google/`: Google OAuth2 authentication.

## 4. Non-Functional Requirements

*   **Security:** All passwords must be hashed. All API endpoints must be secure and protected against common vulnerabilities.
*   **Scalability:** The backend should be designed to handle a growing number of users.
*   **Performance:** API responses should be fast and efficient.

## 5. Out of Scope

*   Course management features.
*   Payment processing.
*   Student dashboard features beyond basic authentication.
