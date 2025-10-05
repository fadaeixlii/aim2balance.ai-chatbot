# Email & Notifications Setup Guide

This document explains how to configure email services in the LibreChat application for sending transactional emails, such as password resets and registration confirmations.

## Overview

LibreChat uses `nodemailer` to send emails and supports two primary methods: **Mailgun** and a generic **SMTP** server. The system prioritizes Mailgun if it is configured; otherwise, it falls back to SMTP.

There is **no built-in support for SMS notifications**. This functionality would need to be added by integrating a third-party SMS gateway like Twilio.

## 1. Mailgun Setup (Recommended)

Using Mailgun is the preferred method as it is a dedicated email delivery service.

-   **How it works:** If the application detects `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` in the `.env` file, it will automatically use the Mailgun API to send emails.
-   **Environment Variables:**
    ```
    # Your Mailgun API key (can be found in your Mailgun account settings)
    MAILGUN_API_KEY="Your-Mailgun-API-Key"

    # The domain you have configured in Mailgun for sending emails
    MAILGUN_DOMAIN="your.mailgun.domain"

    # (Optional) If you are using the EU region for Mailgun
    MAILGUN_HOST="https://api.eu.mailgun.net"
    ```

## 2. SMTP Setup (Fallback)

If you do not configure Mailgun, the system will use a standard SMTP server. This is useful for development or for using other email services like SendGrid, Amazon SES, or a private email server.

-   **How it works:** The application uses the following environment variables to create a `nodemailer` SMTP transport.
-   **Environment Variables:**
    ```
    # The hostname of your SMTP server
    EMAIL_HOST="smtp.example.com"

    # The port of your SMTP server (e.g., 587 for STARTTLS, 465 for TLS)
    EMAIL_PORT=587

    # Your SMTP username
    EMAIL_USERNAME="your-smtp-username"

    # Your SMTP password or app-specific password
    EMAIL_PASSWORD="your-smtp-password"

    # The "From" address for emails
    EMAIL_FROM="noreply@example.com"

    # The "From" name for emails (defaults to the app title)
    EMAIL_FROM_NAME="aim2balance.ai"

    # (Optional) Specify the encryption method: 'tls' or 'starttls'
    EMAIL_ENCRYPTION="starttls"

    # (Optional) Set to "true" to allow self-signed certificates (for development)
    EMAIL_ALLOW_SELFSIGNED=false
    ```

## How It's Used in the Code

-   The core logic is located in `api/server/utils/sendEmail.js`.
-   The `sendEmail` function reads the environment variables to determine which provider to use.
-   It uses `handlebars` to compile HTML email templates located in the `api/server/utils/emails/` directory.
-   This function is called from other parts of the application, such as the registration and password reset routes, to send transactional emails to users.
