# Social Logins Setup Guide

This document explains how to configure and enable social logins in the LibreChat application.

## Overview

LibreChat has built-in support for social logins using Passport.js. The system is designed to be modular, and providers can be enabled by simply adding the appropriate credentials to the `.env` file in the `api` directory.

When the application starts, it checks for the environment variables associated with each social login provider. If the required variables are present, the corresponding Passport.js strategy is initialized, and the social login button is automatically rendered on the login page.

## Supported Providers & Configuration

To enable a social login provider, you must first obtain a **Client ID** and **Client Secret** from the provider's developer console. Once you have these, add them to your `.env` file as shown below.

### Google

-   **Environment Variables:**
    ```
    GOOGLE_CLIENT_ID="Your-Google-Client-ID"
    GOOGLE_CLIENT_SECRET="Your-Google-Client-Secret"
    ```

### GitHub

-   **Environment Variables:**
    ```
    GITHUB_CLIENT_ID="Your-GitHub-Client-ID"
    GITHUB_CLIENT_SECRET="Your-GitHub-Client-Secret"
    ```

### Facebook

-   **Environment Variables:**
    ```
    FACEBOOK_CLIENT_ID="Your-Facebook-Client-ID"
    FACEBOOK_CLIENT_SECRET="Your-Facebook-Client-Secret"
    ```

### Discord

-   **Environment Variables:**
    ```
    DISCORD_CLIENT_ID="Your-Discord-Client-ID"
    DISCORD_CLIENT_SECRET="Your-Discord-Client-Secret"
    ```

### Apple

-   **Environment Variables:**
    ```
    APPLE_CLIENT_ID="Your-Apple-Client-ID-or-Service-ID"
    APPLE_TEAM_ID="Your-Apple-Team-ID"
    APPLE_KEY_ID="Your-Apple-Key-ID"
    APPLE_PRIVATE_KEY_PATH="/path/to/your/AuthKey_YourKeyID.p8"
    ```
    *Note: For Apple, you need a private key file (`.p8`) and must provide the path to it.*

## How It Works

-   **Backend:** The file `api/server/socialLogins.js` contains the `configureSocialLogins` function. This function is called on server startup and checks for the presence of the environment variables listed above. If a pair of credentials (e.g., `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`) is found, it initializes the corresponding Passport strategy (e.g., `googleLogin()`).

-   **Frontend:** The client-side code checks which login strategies are enabled via an API endpoint. It then dynamically renders the social login buttons on the login page. If you add the environment variables and restart the server, the "Sign in with Google" (or other provider) button will appear automatically.
