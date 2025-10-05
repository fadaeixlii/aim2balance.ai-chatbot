# LibreChat Authentication Flow (Local Login)

This document explains how a user logs in to LibreChat using their email and password.

## High-Level Overview

The login process is a great example of the backend's layered architecture. A request to `/api/auth/login` passes through several layers of middleware before a final response is sent to the user. Each layer has a specific responsibility, from security checks to credential validation.

## Step-by-Step Data Flow

Here’s what happens when a user clicks the "Log In" button:

### 1. The API Request

The frontend sends a `POST` request to the `/api/auth/login` endpoint. The body of this request contains the user's `email` and `password`.

### 2. The Middleware Chain (`/api/server/routes/auth.js`)

The request is first handled by the `auth.js` router, which defines a chain of middleware functions that execute in order:

-   `middleware.loginLimiter`: A rate-limiter to prevent brute-force attacks.
-   `middleware.checkBan`: Checks if the user is banned.
-   `middleware.requireLocalAuth`: This is the core of the authentication logic.

### 3. Credential Validation (`/api/server/middleware/requireLocalAuth.js`)

The `requireLocalAuth` middleware uses **Passport.js**, a popular authentication library for Node.js. It specifically calls the `passport.authenticate('local', ...)` function. This tells Passport to use its "local" strategy.

### 4. The "Local" Passport Strategy (`/api/strategies/localStrategy.js`)

This is where the user's credentials are actually verified:

1.  **Find the User:** The strategy first queries the MongoDB database to find a user whose email matches the one provided in the request (`findUser({ email: ... })`).
2.  **Check for Password:** It ensures the user record has a password. If not (e.g., if the user signed up via a social login), it rejects the login attempt.
3.  **Compare Passwords:** It uses a function (`comparePassword`) to securely compare the password provided by the user with the hashed password stored in the database. This is a critical security step to avoid storing plain-text passwords.
4.  **Check Email Verification:** It checks if the user's email has been verified. If not, and if the server requires it, the login is rejected.
5.  **Success or Failure:**
    *   If all checks pass, the strategy returns the `user` object.
    *   If any check fails, it returns `false` along with an error message (e.g., "Incorrect password.").

### 5. Back to the Middleware

The `requireLocalAuth` middleware receives the result from the Passport strategy.

-   If the login was successful, it attaches the `user` object to the `req` object (as `req.user`) and calls `next()` to pass control to the next middleware in the chain.
-   If it failed, it immediately sends an error response to the user (e.g., a `422` status code with the error message).

### 6. The Login Controller (`/api/server/controllers/auth/LoginController.js`)

After the `requireLocalAuth` middleware successfully authenticates the user, control is passed to the `loginController`:

1.  **Check for 2FA:** It first checks if the user has two-factor authentication (2FA) enabled. If so, it sends a temporary token and prompts the user for their 2FA code.
2.  **Generate Tokens:** If 2FA is not enabled, it calls the `setAuthTokens` service. This service generates a JSON Web Token (JWT) and a refresh token.
3.  **Send Response:** The controller sends a `200 OK` response to the frontend, which includes the JWT and the user's information. The frontend can then store this token and use it to make authenticated requests to the API.
