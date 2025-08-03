# Login Guide for CarLog

## How to Test Login

### 1. First, Register a User

1. Go to `http://localhost:3000/register`
2. Enter:
   - Email: your-email@example.com
   - Password: password123 (minimum 6 characters)
   - Phone Number: +1234567890 (optional)
3. Click "Register"
4. You'll be redirected to the profile page

### 2. Logout to Test Login

1. Click "Logout" in the navigation menu
2. You'll be redirected to the home page

### 3. Login with Your Credentials

1. Go to `http://localhost:3000/login`
2. Enter:
   - Email: your-email@example.com
   - Password: password123
3. Click "Login"
4. You'll be redirected to the dashboard

## Login Flow Details

### Frontend
- **Login Page**: `/frontend/src/pages/Login.tsx`
- Sends email and password to backend
- Shows specific error messages if login fails
- Redirects to dashboard on success

### Backend
- **Endpoint**: `POST /api/v1/auth/login`
- Expects form data with `username` (email) and `password`
- Returns JWT token valid for 8 days
- Token is stored in localStorage

### Authentication Process
1. User enters email/password
2. Frontend sends credentials as form data
3. Backend verifies password against hashed password in Neo4j
4. If valid, returns JWT token
5. Frontend stores token and fetches user info
6. User is logged in and can access protected routes

## Common Issues

### "Incorrect email or password"
- User doesn't exist
- Password is wrong
- Make sure you registered first

### 422 Unprocessable Entity
- Wrong request format
- Make sure frontend is sending form data, not JSON

### Can't Access Protected Pages
- Token might be expired
- Try logging in again

## Quick Test Script

To create and test a user programmatically:

```bash
cd /Users/gcp/Projects/carlog/backend
source .venv/bin/activate

# Register a test user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","phone_number":"+1234567890"}'

# Login with the test user
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```

## Security Features

- Passwords are hashed with bcrypt
- JWT tokens expire after 8 days
- Protected routes require valid token
- Tokens are verified on each request