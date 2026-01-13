# ARCHITECTURAL SHOWCASE SUBMISSION PORTAL - COMPLETE SETUP GUIDE

## What You Have

A complete, production-ready web application with:
- ✅ Architect registration & login
- ✅ Multi-section submission form (matches your PDF)
- ✅ Auto-save functionality
- ✅ Admin review dashboard
- ✅ Excel export capability
- ✅ Email notifications
- ✅ Mobile-responsive design

---

## STEP 1: Prepare Your Environment

### What You'll Need:
1. **Node.js** (download from nodejs.org) - includes npm
2. **PostgreSQL** (download from postgresql.org)
3. **Gmail account** (for email notifications, or use your company email with app passwords)
4. **Code editor** (VS Code recommended)
5. **Git** (optional, for version control)

### Verify Installation:
```bash
node --version    # Should show v14+
npm --version     # Should show 6+
psql --version    # Should show PostgreSQL 12+
```

---

## STEP 2: Set Up Database

### Create the database:
```bash
createdb architectural_showcase
```

That's it! The application will create tables automatically on first run.

---

## STEP 3: Configure Backend

### 1. Navigate to backend folder:
```bash
cd architectural-showcase/backend
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Create `.env` file from template:
```bash
cp .env.example .env
```

### 4. Edit `.env` with your settings:
```
DATABASE_URL=postgresql://localhost/architectural_showcase
JWT_SECRET=change-this-to-a-random-string-in-production
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
ADMIN_EMAIL=admin@yourmediacompany.com
PORT=5000
```

**For Gmail Email:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password shown
4. Paste into EMAIL_PASSWORD

### 5. Start the backend:
```bash
npm start
```

You should see: `Server running on port 5000`

Keep this terminal open. Your API is now running at `http://localhost:5000`

---

## STEP 4: Configure Frontend

### 1. In a NEW terminal, navigate to frontend:
```bash
cd architectural-showcase/frontend
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Create `.env` file:
```bash
cp .env.example .env
```

The `.env` file should contain:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start the frontend:
```bash
npm start
```

Your browser should automatically open to `http://localhost:3000`

---

## STEP 5: First-Time Testing

### 1. Register as an Architect:
- Email: `architect@example.com`
- Firm: `Test Architecture Firm`
- Name: `John Architect`
- Password: `TestPassword123`
- Click "Register"

### 2. Fill out the form:
- Enter project details (only some fields are required: marked with *)
- Notice the "Auto-saving: Saved" indicator
- The form saves every second as you type
- You can close and return - your data is saved

### 3. Create Admin Account:
- Go back to login page
- Register: `admin@yourmediacompany.com`
- Password: `AdminPassword123`
- Click "Register"

### 4. Make it Admin:
- Open PostgreSQL:
  ```bash
  psql architectural_showcase
  ```
- Run this command:
  ```sql
  UPDATE users SET is_admin = true WHERE email = 'admin@yourmediacompany.com';
  ```
- Exit PostgreSQL (type: `\q`)

### 5. Complete a Submission (as Architect):
- Click "Mark as Completed & Submit"
- You'll see a success message
- The admin should receive an email

### 6. View Admin Dashboard (as Admin):
- Log out
- Login as `admin@yourmediacompany.com`
- You'll be redirected to `/admin` dashboard
- You should see the submission you just created
- Click "Export to Excel" to download a spreadsheet

---

## STEP 6: Customize for Your Needs

### Change Project Categories:
Edit: `frontend/src/pages/SubmissionForm.js`
Find: `const manufacturerCategories = [`
Add/remove categories as needed

### Change Architect Roles:
Edit: `frontend/src/pages/SubmissionForm.js`
Find: `const architectRoles = [`
Add/remove roles as needed

### Change Form Fields:
Edit the form sections in `frontend/src/pages/SubmissionForm.js`
The form structure mirrors your sample PDF exactly

### Change Email Template:
Edit: `backend/server.js`
Find: `transporter.sendMail({` in the "complete submission" route
Customize the HTML template for your email

---

## STEP 7: Deploy to Production

### Option A: Railway.app (Easiest)

1. **Install Git and set up GitHub:**
   - Create free GitHub account
   - Install Git locally
   
2. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/architectural-showcase.git
   git push -u origin main
   ```

3. **Deploy on Railway:**
   - Go to https://railway.app
   - Sign up with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your repository
   - Railway automatically detects Node.js and React

4. **Set Environment Variables:**
   - In Railway dashboard, go to Backend service
   - Click "Variables" tab
   - Add:
     ```
     DATABASE_URL = [Railway auto-generates this]
     JWT_SECRET = [generate random: openssl rand -base64 32]
     EMAIL_USER = your-email@gmail.com
     EMAIL_PASSWORD = gmail-app-password
     ADMIN_EMAIL = admin@yourmediacompany.com
     ```

5. **Set Frontend Variables:**
   - In Railway dashboard, go to Frontend service
   - Click "Variables" tab
   - Add:
     ```
     REACT_APP_API_URL = https://[your-backend-url].railway.app/api
     ```

6. **Make first admin account:**
   - Use Railway PostgreSQL connection in CLI or pgAdmin
   - Run:
     ```sql
     UPDATE users SET is_admin = true WHERE email = 'admin@yourmediacompany.com';
     ```

Done! Your portal is now live.

### Option B: Heroku (Also Easy)

See DEPLOYMENT.md for detailed Heroku instructions.

### Option C: Your Own Server

See DEPLOYMENT.md for detailed server setup instructions.

---

## STEP 8: Launch to Architects

### Share the portal:
- Send this URL: `https://your-domain.com` (or your Railway/Heroku URL)
- Provide login instructions
- They register, fill out form, and submit

### When they submit:
- You get an email notification
- You review in admin dashboard
- You export to Excel
- You send them the image upload instructions

### Image Upload Process:
After they submit, you can:
1. Send them a Google Drive share link
2. Send them a Dropbox link
3. Use WeTransfer
4. Use your company's file transfer system

The form auto-saves, so they can:
- Start filling and come back later
- Edit their submission anytime
- Submit when ready

---

## TROUBLESHOOTING

### "Cannot connect to database"
**Solution:**
```bash
psql architectural_showcase
\q
```
If that doesn't work, ensure PostgreSQL is running.

### "Cannot connect to server" (frontend error)
**Solution:**
- Check backend is running on port 5000
- Check REACT_APP_API_URL in frontend/.env is correct
- Check browser console (F12) for errors

### Email not sending
**Solutions:**
1. Verify EMAIL_USER and EMAIL_PASSWORD in .env
2. For Gmail, ensure you created an App Password (not your regular password)
3. Check ADMIN_EMAIL is a valid email address
4. Check backend logs for error messages

### Form not saving
**Solution:**
- Check browser console (F12) for JavaScript errors
- Verify REACT_APP_API_URL is correct
- Ensure backend is running

### Can't log in as admin
**Solution:**
```bash
psql architectural_showcase
SELECT * FROM users;  # Check if user exists
UPDATE users SET is_admin = true WHERE email = 'admin@yourmediacompany.com';
\q
```

---

## IMPORTANT PRODUCTION NOTES

Before launching to architects:

✅ Change JWT_SECRET to a random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

✅ Use HTTPS (Railway/Heroku do this automatically)

✅ Set secure database passwords

✅ Update dependencies:
```bash
npm audit fix
```

✅ Back up your PostgreSQL database regularly

✅ Monitor email sending (check spam folder if issues)

---

## ONGOING MANAGEMENT

### Regular Tasks:

**Weekly:**
- Check admin dashboard for new submissions
- Review form submissions for completeness
- Send architects image upload links

**Monthly:**
- Export submissions to Excel
- Back up PostgreSQL database
- Review and select projects for showcase

**As Needed:**
- Add more architect accounts
- Update form fields/categories
- Export data for publications

### Accessing the Dashboard:

**For Admins:**
- URL: `https://your-domain.com/admin`
- Email: your admin email
- Password: your admin password

**For Architects:**
- URL: `https://your-domain.com`
- Email: their registered email
- Password: their password

---

## FILE STRUCTURE

```
architectural-showcase/
├── backend/
│   ├── server.js          ← Main API code
│   ├── package.json       ← Dependencies
│   └── .env               ← Your secret settings
│
├── frontend/
│   ├── src/
│   │   ├── pages/         ← Form, Login, Admin pages
│   │   ├── App.js         ← Main app
│   │   └── App.css        ← Styling
│   └── .env               ← API URL setting
│
├── README.md              ← Project overview
├── QUICKSTART.md          ← Fast setup guide
├── DEPLOYMENT.md          ← Production deployment
└── THIS FILE              ← Complete guide
```

---

## GETTING HELP

If something isn't working:

1. **Check the error message** - read it carefully, it often tells you what's wrong
2. **Check browser console** - F12, then Console tab
3. **Check backend logs** - look at the terminal running `npm start`
4. **Check environment variables** - ensure all `.env` files are correct
5. **Review DEPLOYMENT.md** - has troubleshooting section

---

## NEXT STEPS

1. ✅ Set up database and environment
2. ✅ Start backend with `npm start`
3. ✅ Start frontend with `npm start`
4. ✅ Test with sample architect and admin accounts
5. ✅ Export test data to Excel
6. ✅ Deploy to Railway or your server
7. ✅ Share URL with your architects
8. ✅ Start collecting submissions!

---

## TIMELINE ESTIMATE

- Setup: 30 minutes
- Testing: 30 minutes
- Deployment: 30 minutes
- Ready to go: < 2 hours

You should be able to have this live by end of month no problem!

---

Good luck with your Architectural Showcase! 🎉

Questions? Check DEPLOYMENT.md for more detailed information.
