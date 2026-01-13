# Architectural Showcase Submission Portal - Deployment Guide

## Overview
This is a complete web application for managing architectural project submissions. Architects can register, fill out project forms with auto-save, and submit for review. Admins can review submissions and export to Excel.

## Tech Stack
- **Backend**: Node.js/Express
- **Frontend**: React
- **Database**: PostgreSQL
- **Email**: Nodemailer (Gmail or other SMTP)

---

## Quick Start (Local Development)

### Prerequisites
- Node.js (v14+)
- PostgreSQL (local or hosted)
- Gmail account or other SMTP service (for email notifications)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```
DATABASE_URL=postgresql://user:password@localhost:5432/architectural_showcase
JWT_SECRET=your-super-secret-key-change-in-production
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
ADMIN_EMAIL=admin@yourmediacompany.com
PORT=5000
```

**For Gmail:**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an "App Password" (go to https://myaccount.google.com/apppasswords)
3. Use that password in `EMAIL_PASSWORD`

Start the backend:
```bash
npm start
```

The API will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

The app will run on `http://localhost:3000`

### 3. Create Admin Account

The system ships with user registration. To make an account an admin:

Connect to your PostgreSQL database:
```bash
psql postgresql://user:password@localhost:5432/architectural_showcase
```

Update a user to admin:
```sql
UPDATE users SET is_admin = true WHERE email = 'admin@yourmediacompany.com';
```

---

## Production Deployment

### Option 1: Railway (Recommended - Simple)

Railway is a modern hosting platform that's easy to deploy to.

1. **Create Railway account** at https://railway.app

2. **Deploy Backend:**
   - Connect your GitHub repo (or use Railway CLI)
   - Railway automatically detects `package.json`
   - Add these environment variables in Railway dashboard:
     - `DATABASE_URL` (Railway provides PostgreSQL)
     - `JWT_SECRET` (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
     - `EMAIL_USER` (your Gmail)
     - `EMAIL_PASSWORD` (Gmail app password)
     - `ADMIN_EMAIL` (your admin email)

3. **Deploy Frontend:**
   - Same process, Railway will run `npm run build`
   - Set environment variable: `REACT_APP_API_URL=https://your-backend-url.railway.app/api`
   - Frontend will be available at `https://your-frontend-url.railway.app`

### Option 2: Heroku (Also Simple)

```bash
# Install Heroku CLI, then:
heroku login
heroku create architectural-showcase-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main

# Set env vars:
heroku config:set JWT_SECRET=your-secret-key
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-password
heroku config:set ADMIN_EMAIL=admin@yourmediacompany.com
```

### Option 3: Your Own Server

If you have an existing server:

```bash
# Backend
cd backend
npm install --production
npm start

# Frontend
cd frontend
npm install
npm run build
# Serve the `build` folder with nginx or your web server

# Database
# Install PostgreSQL and create a database
```

Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name "architectural-showcase"
```

---

## Database Setup

The system automatically creates tables on first run. If you need to manually set up:

```sql
-- Connect to your database
psql your_database

-- Tables are created automatically when backend starts
-- But you can create them manually:

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  firm_name VARCHAR(255),
  contact_name VARCHAR(255),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_name VARCHAR(255),
  project_location VARCHAR(255),
  project_address TEXT,
  contact_name VARCHAR(255),
  contact_title VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  contact_role VARCHAR(255),
  authorization BOOLEAN DEFAULT false,
  project_type VARCHAR(255),
  project_category VARCHAR(255),
  date_of_occupancy DATE,
  total_construction_cost VARCHAR(100),
  total_gross_sqft VARCHAR(100),
  seating_capacity VARCHAR(100),
  cost_per_sqft VARCHAR(100),
  primary_funding VARCHAR(255),
  facility_rep_name VARCHAR(255),
  facility_rep_title VARCHAR(255),
  facility_rep_phone VARCHAR(20),
  facility_rep_email VARCHAR(255),
  facility_rep_address TEXT,
  manufacturers_suppliers JSONB,
  project_summary TEXT,
  project_description TEXT,
  special_instructions TEXT,
  architects JSONB,
  photo_credits TEXT,
  photo_special_instructions TEXT,
  status VARCHAR(50) DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Email Setup

The system uses Nodemailer for sending emails. By default configured for Gmail.

### Gmail Setup:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the generated password
4. Use in `EMAIL_PASSWORD` env variable

### Other Email Services:

**SendGrid:**
```javascript
// Replace transporter in server.js
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

**AWS SES, Mailgun, etc.** - See Nodemailer documentation

---

## Admin Features

### Login as Admin
1. Register an account
2. Make the account admin (via database UPDATE)
3. Login and navigate to `/admin`

### Admin Dashboard
- View all submissions with status
- See submission statistics
- Export all data to Excel file
- Click email links to contact architects

### Excel Export
- Downloads as `.xlsx` file
- Includes all project details
- Easily sortable and filterable
- Use for your showcase selection process

---

## Customization

### Add More Architect Roles

Edit `frontend/src/pages/SubmissionForm.js`:
```javascript
const architectRoles = [
  'Architect of Record',
  'Associate Architect',
  'Design Architect',
  'YOUR NEW ROLE HERE',  // Add here
  // ...
];
```

### Modify Manufacturer Categories

Edit `frontend/src/pages/SubmissionForm.js`:
```javascript
const manufacturerCategories = [
  'Your Custom Category 1',
  'Your Custom Category 2',
  // ...
];
```

### Change Email Template

Edit `backend/server.js` in the `POST /api/submissions/:id/complete` route:
```javascript
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: ADMIN_EMAIL,
  subject: 'YOUR SUBJECT HERE',
  html: `YOUR HTML TEMPLATE HERE`
});
```

---

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Try connecting manually: `psql your_database`

### "Email not sending"
- Check EMAIL_USER and EMAIL_PASSWORD are correct
- For Gmail, ensure you've created an App Password
- Check ADMIN_EMAIL is correct
- Look at console logs for errors

### Frontend can't reach backend
- Check `REACT_APP_API_URL` is set correctly
- Ensure backend is running
- Check for CORS errors in browser console
- For production, whitelist your frontend domain in backend CORS config

### Blank page after login
- Check browser console for JavaScript errors
- Ensure token is being saved to localStorage
- Check `Authorization` header in network requests

---

## Features

✅ User registration and login
✅ Multi-section submission form
✅ Auto-save as users type
✅ Return to submissions anytime
✅ Admin review dashboard
✅ Excel export of all submissions
✅ Email notifications when submitted
✅ Mobile-responsive design
✅ Secure JWT authentication
✅ Password hashing with bcrypt

---

## Support

For issues or questions:
1. Check logs in your deployment platform
2. Review browser console (F12) for errors
3. Test email configuration separately
4. Verify environment variables are set correctly

---

## Security Notes

⚠️ **Before going live:**
- Change `JWT_SECRET` to a random string (not "your-secret-key")
- Use HTTPS in production
- Keep dependencies updated: `npm audit` and `npm update`
- Never commit `.env` files to git
- Use strong database passwords
- Regularly backup your PostgreSQL database
- Consider rate limiting on API endpoints

---

Good luck with your submission portal! 🚀
