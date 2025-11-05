# Better Auth Documentation

This guide covers the Better Auth authentication system implementation in the application, including setup, configuration, and integration examples.

## Table of Contents

- [Overview](#overview)
- [Backend Setup](#backend-setup)
- [Frontend Integration](#frontend-integration)
- [Authentication Flows](#authentication-flows)
- [Social Login](#social-login)
- [Session Management](#session-management)
- [Security Considerations](#security-considerations)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## Overview

Better Auth is a modern authentication library that provides secure, scalable authentication with support for multiple providers including email/password and OAuth providers like GitHub.

**Key Features:**
- Email and password authentication
- Social OAuth providers (GitHub, Google, etc.)
- JWT-based session management
- Type-safe API with full TypeScript support
- Organization/multi-tenant support
- Built-in security features (rate limiting, CSRF protection)
- Database-agnostic with adapter support

**Architecture:**
- **Backend**: NestJS integration using `@thallesp/nestjs-better-auth`
- **Frontend**: React integration using `better-auth/react`
- **Database**: TypeORM adapter for PostgreSQL
- **Session**: HTTP-only cookies with JWT tokens

## Backend Setup

### Installation and Configuration

The backend uses Better Auth integrated with NestJS via the `@thallesp/nestjs-better-auth` package.

**Main Configuration File (`apps/backend/src/auth.ts`):**
```typescript
import { dataSource } from "./database/better-auth-data-source.js";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { TypeormAdapter } from "./auth/adapter/typeorm-adapter.js";

export const auth = betterAuth({
  database: TypeormAdapter(dataSource),
  plugins: [organization()],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: authEnv.GITHUB_CLIENT_ID,
      clientSecret: authEnv.GITHUB_CLIENT_SECRET,
    },
  },
  trustedOrigins: ["http://localhost:3000", "http://localhost:5010"],
});
```

### Environment Variables

**Required Environment Variables:**
```bash
# GitHub OAuth (for social login)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Database connection (shared with app)
# Better Auth uses the same TypeORM data source
```

### Database Schema

Better Auth automatically creates the necessary database tables when initialized. The schema includes:

- **Users**: Core user information
- **Sessions**: Active user sessions
- **Accounts**: OAuth account connections
- **Organizations**: Multi-tenant organization support
- **Members**: Organization membership relationships

### Entity Generation

Better Auth provides a CLI tool to generate TypeORM entities that match the database schema. This is useful for development and when you need to work with the authentication tables directly.

**Generate Entities:**
```bash
npx @better-auth/cli@latest info --config ./apps/backend/src/auth.ts
```

This command will create a `typeorm` folder in the root directory containing the generated entities. Each entity file should be renamed with the `.entity.ts` extension to follow NestJS conventions:

```bash
# Generated files (rename these):
typeorm/user.ts → typeorm/user.entity.ts
typeorm/session.ts → typeorm/session.entity.ts
typeorm/account.ts → typeorm/account.entity.ts
typeorm/organization.ts → typeorm/organization.entity.ts
typeorm/member.ts → typeorm/member.entity.ts
```
copy the generated entities to `apps/backend/src/auth/entities`

**Entity Structure Example:**
```typescript
// user.entity.ts (after renaming)
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  email: string;

  @Column('text', { nullable: true })
  name: string;

  @Column('text', { nullable: true })
  image: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp')
  updatedAt: Date;
}
```

**Note:** The generated entities should be reviewed and may need adjustments for your specific TypeORM configuration and naming conventions.

### TypeORM Adapter

The application uses a custom TypeORM adapter for PostgreSQL compatibility:

```typescript
// Custom adapter for TypeORM + PostgreSQL
export class TypeormAdapter {
  // Implementation handles user, session, and account CRUD operations
  // Compatible with Better Auth's expected interface
}
```

### NestJS Integration

Better Auth is integrated into the NestJS application through:

1. **Auth Module**: Registers the auth instance as a provider
2. **Auth Routes**: Mounts auth endpoints at `/api/auth/*`
3. **Middleware**: Handles authentication state and session validation

## Frontend Integration

### Client Setup

The frontend uses the Better Auth React client for type-safe authentication operations.

**Client Configuration (`apps/web/lib/auth-client.ts`):**
```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: `${Env.NEXT_PUBLIC_API_URL}/api/auth`,
}) as ReturnType<typeof createAuthClient>;
```

### Environment Variables

**Frontend Environment:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Authentication Hooks

The application uses a custom React context for authentication state management:

```typescript
import { useAuth } from "@/providers/auth-provider";

// In your components
function AuthComponent() {
  const { session, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!session?.user) {
    return (
      <div>
        {/* Authentication UI */}
      </div>
    );
  }

  return (
    <div>
      <p>Welcome, {session.user.email}!</p>
      {/* Authenticated UI */}
    </div>
  );
}
```

## Authentication Flows

### Email and Password Authentication

**Sign Up:**
```typescript
const signUp = async (email: string, password: string) => {
  try {
    const result = await authClient.signUp.email({
      email,
      password,
      name: "User Name", // Optional
    });
    return result;
  } catch (error) {
    console.error('Sign up failed:', error);
    throw error;
  }
};
```

**Sign In:**
```typescript
const signIn = async (email: string, password: string) => {
  try {
    const result = await authClient.signIn.email({
      email,
      password,
    });
    return result;
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
};
```

### Social Authentication

**GitHub OAuth:**
```typescript
const signInWithGithub = async () => {
  try {
    const result = await authClient.signIn.social({
      provider: "github",
    });
    // Redirects to GitHub OAuth flow
    return result;
  } catch (error) {
    console.error('GitHub sign in failed:', error);
    throw error;
  }
};
```

### Sign Out

**Logout:**
```typescript
const signOut = async () => {
  try {
    await authClient.signOut();
    // User is now logged out and session is cleared
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
};
```

## Social Login

### GitHub OAuth Setup

1. **Create GitHub OAuth App:**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Fill in application details:
     - **Application name**: Your app name
     - **Homepage URL**: `http://localhost:3000` (development)
     - **Authorization callback URL**: `http://localhost:3001/api/auth/callback/github`

2. **Get Credentials:**
   - Copy the **Client ID**
   - Generate and copy the **Client Secret**

3. **Configure Environment:**
   ```bash
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

4. **Frontend Implementation:**
   ```tsx
   import { useAuth } from "@/lib/auth-client";

   function GitHubLoginButton() {
     const { signIn } = useAuth();

     const handleGitHubLogin = () => {
       signIn.social({ provider: "github" });
     };

     return (
       <button onClick={handleGitHubLogin}>
         Sign in with GitHub
       </button>
     );
   }
   ```

### OAuth Flow

1. User clicks "Sign in with GitHub"
2. Frontend redirects to `/api/auth/sign-in/github`
3. Backend redirects to GitHub OAuth authorization URL
4. User authorizes the application on GitHub
5. GitHub redirects back to `/api/auth/callback/github`
6. Backend processes the callback and creates/updates user account
7. User is redirected back to frontend with authentication state

## Session Management

### Session Handling

Better Auth manages sessions automatically using HTTP-only cookies:

- **Access Tokens**: Short-lived JWT tokens for API authentication
- **Refresh Tokens**: Long-lived tokens for session renewal
- **Session Cookies**: HTTP-only, secure cookies

### Session Validation

**Backend Session Check:**
```typescript
// Sessions are automatically validated on protected routes
// Use auth middleware or guards to protect endpoints
```

**Frontend Session Check:**
```typescript
const { session, isLoading } = useAuth();

// session will be null if not authenticated
// session.user contains user info when authenticated
// isLoading will be true while checking session status
```

### Session Persistence

Sessions persist across browser sessions and tabs. The authentication state is automatically restored when the user returns to the application.

## Security Considerations

### Built-in Security Features

Better Auth includes several security measures:

- **CSRF Protection**: Automatic CSRF token validation
- **Rate Limiting**: Built-in rate limiting for auth endpoints
- **Secure Cookies**: HTTP-only, secure, same-site cookies
- **JWT Security**: Proper JWT token handling and validation
- **OAuth Security**: Secure OAuth flow implementation

### Environment Security

**Production Configuration:**
```typescript
export const auth = betterAuth({
  // ... other config
  trustedOrigins: ["https://yourdomain.com"],
  // Enable additional security in production
  secureCookies: process.env.NODE_ENV === "production",
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});
```

### Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Secure Cookies**: Enable secure cookie flags
3. **Environment Variables**: Never commit secrets to code
4. **Rate Limiting**: Configure appropriate rate limits
5. **Session Timeout**: Set reasonable session lifetimes
6. **Password Policies**: Enforce strong password requirements

## Configuration

### Backend Configuration Options

```typescript
export const auth = betterAuth({
  // Database adapter
  database: TypeormAdapter(dataSource),

  // Authentication methods
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true for production
  },

  // Social providers
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  // Security settings
  trustedOrigins: ["http://localhost:3000", "https://yourdomain.com"],
  secureCookies: process.env.NODE_ENV === "production",

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Plugins
  plugins: [organization()],
});
```

### Frontend Configuration

```typescript
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/auth",

  // Optional: Custom fetch function
  fetchOptions: {
    onRequest: (context) => {
      // Add custom headers, logging, etc.
      return context;
    },
    onResponse: (context) => {
      // Handle responses
      return context;
    },
  },
});
```

## API Reference

### Authentication Endpoints

All auth endpoints are available under `/api/auth/`:

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session
- `GET /api/auth/sign-in/github` - GitHub OAuth initiation
- `GET /api/auth/callback/github` - GitHub OAuth callback

### Client Methods

**Authentication Methods:**
```typescript
// Email/Password
await authClient.signUp.email({ email, password, name })
await authClient.signIn.email({ email, password })

// Social
await authClient.signIn.social({ provider: "github" })

// Session management
await authClient.signOut()
const session = await authClient.getSession()
```

**React Hooks:**
```typescript
const { session, isLoading } = useAuth()
// session: { user?: { id: string; email: string; name: string } } | null
// isLoading: boolean - true while checking authentication status
```

## Troubleshooting

### Common Issues

1. **"Invalid origin" Error**
   - Check `trustedOrigins` configuration
   - Ensure frontend URL is included in trusted origins
   - Use correct protocol (http/https)

2. **OAuth Redirect Issues**
   - Verify callback URLs in OAuth provider settings
   - Check that `baseURL` in client matches backend URL
   - Ensure proper CORS configuration

3. **Session Not Persisting**
   - Check cookie settings in browser dev tools
   - Verify `secureCookies` setting for HTTPS
   - Check for cookie domain/path issues

4. **Database Connection Errors**
   - Verify TypeORM data source configuration
   - Check database credentials
   - Ensure database is running and accessible

5. **Type Errors**
   - Ensure you're using the correct import: `better-auth/react`
   - Check TypeScript configuration
   - Update to latest version of better-auth packages

### Debug Mode

Enable detailed logging for troubleshooting:

```typescript
// Backend: Add to auth configuration
export const auth = betterAuth({
  // ... other config
  logger: {
    level: "debug",
    disabled: false,
  },
});
```

### Environment Checklist

- ✅ `GITHUB_CLIENT_ID` set correctly
- ✅ `GITHUB_CLIENT_SECRET` set correctly
- ✅ `NEXT_PUBLIC_API_URL` matches backend URL
- ✅ Database connection working
- ✅ CORS configured properly
- ✅ HTTPS enabled in production

**Note:** For applications requiring file upload/storage capabilities alongside authentication, see the [File Upload Documentation](../file-upload.md) for implementing secure file operations with MinIO storage.

Previous: [Database](database.md)

Next: [File Upload](file-upload.md)