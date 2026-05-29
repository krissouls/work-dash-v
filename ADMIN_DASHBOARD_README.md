# WorkDash Admin Dashboard Setup Guide

## 📋 Overview

Complete admin dashboard for managing jobs, workers, assignments, attendance, and payments with real-time Firebase sync.

## 🚀 Quick Start

### 1. Firebase Configuration

#### Get Firebase Credentials:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Realtime Database**
4. Go to Project Settings → Service Accounts
5. Copy your credentials

#### Create `.env.local` file:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Firebase Security Rules

Replace the default Realtime Database rules with:

```json
{
  "rules": {
    "admins": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "root.child('admins').child(auth.uid).child('role').val() === 'super_admin'"
      }
    },
    "jobs": {
      ".read": "auth != null",
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "workers": {
      ".read": "auth != null",
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "assignments": {
      ".read": "auth != null",
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "attendance": {
      ".read": "auth != null",
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "payments": {
      ".read": "auth != null",
      ".write": "root.child('admins').child(auth.uid).exists()"
    }
  }
}
```

### 3. Install Dependencies

```bash
npm install
# or
pnpm install
```

Firebase is already included in package.json.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## 📂 Project Structure

```
app/
├── admin/
│   ├── login/              # Authentication page
│   ├── dashboard/          # Overview & statistics
│   ├── jobs/              # Job management (CRUD)
│   ├── workers/           # Worker database (CRUD)
│   ├── assignments/       # Assign workers to jobs
│   ├── attendance/        # Attendance tracking
│   └── payments/          # Payment management

lib/
├── firebase.ts            # Firebase config & initialization
├── types.ts              # TypeScript interfaces
├── auth-context.tsx      # Auth context provider
├── admin-guard.tsx       # Protected route wrapper

components/
└── admin-layout.tsx      # Sidebar layout component
```

## 🔐 Authentication

1. **Create Account**: Click "Sign Up" on login page
2. **Login**: Use your email/password
3. **Admin Access**: Create first account manually

### Adding Admin Roles:

After creating an account, manually add to Firebase:

1. Go to Realtime Database
2. Add new path: `admins/{userId}`
3. Add this data:
```json
{
  "name": "Your Name",
  "email": "your@email.com",
  "role": "admin",
  "createdAt": 1234567890
}
```

Roles:
- `admin` - Basic admin access
- `manager` - Can create jobs, assign workers
- `finance` - Can manage payments
- `super_admin` - Full access including user management

## 📊 Modules

### Jobs
- ✅ Create, read, update, delete jobs
- ✅ Filter by status (active, completed, cancelled)
- ✅ Track assigned workers per job
- ✅ Budget and location management

### Workers
- ✅ Manage worker database
- ✅ Skills tagging
- ✅ Track total earnings
- ✅ Status management (active/inactive)

### Assignments
- ✅ Assign workers to jobs
- ✅ Track assignment status (pending, accepted, in-progress, completed)
- ✅ Update status in real-time
- ✅ Delete assignments

### Attendance
- ✅ Mark daily attendance
- ✅ Check-in/Check-out time tracking
- ✅ Automatic hours calculation
- ✅ Status tracking (present, absent, late)
- ✅ Date-based filtering

### Payments
- ✅ Create payment records
- ✅ Track payment status (pending, approved, processed, failed)
- ✅ Payment methods (Bank Transfer, UPI, Cash, Cheque)
- ✅ Amount and date tracking
- ✅ Summary statistics

## 🔄 Real-time Updates

All modules use Firebase Realtime Database listeners:
- Changes sync across all users instantly
- Optimistic UI updates before server confirmation
- Toast notifications for success/error feedback
- Automatic data refresh on changes

## 💾 Data Structure

### Jobs Collection
```typescript
{
  id: string
  title: string
  description: string
  category: string
  location: string
  budget: number
  status: 'active' | 'completed' | 'cancelled'
  assignedWorkers: string[] // Worker IDs
  createdAt: number
  createdBy: string
}
```

### Workers Collection
```typescript
{
  id: string
  name: string
  email: string
  phone: string
  skills: string[]
  status: 'active' | 'inactive'
  joinDate: number
  totalEarnings: number
  avatar?: string
}
```

### Assignments Collection
```typescript
{
  id: string
  jobId: string
  workerId: string
  status: 'pending' | 'accepted' | 'in-progress' | 'completed'
  assignedAt: number
  completedAt?: number
}
```

### Attendance Collection
```typescript
{
  id: string
  workerId: string
  jobId: string
  date: string // YYYY-MM-DD
  checkIn?: number
  checkOut?: number
  status: 'present' | 'absent' | 'late'
  hours?: number
}
```

### Payments Collection
```typescript
{
  id: string
  workerId: string
  jobId: string
  amount: number
  status: 'pending' | 'approved' | 'processed' | 'failed'
  paymentDate: number
  method: string
  notes?: string
}
```

## 🎨 UI Components

Built with shadcn/ui components:
- Buttons, Inputs, Dialogs
- Cards, Tables, Selects
- Forms with validation
- Responsive design
- Dark mode support

## 🧪 Testing

### Test Workflow:

1. **Create Job**:
   - Navigate to Jobs
   - Click "Create Job"
   - Fill details and save
   - Verify in dashboard stats

2. **Add Worker**:
   - Navigate to Workers
   - Click "Add Worker"
   - Fill details with skills
   - Verify in worker list

3. **Assign Worker**:
   - Navigate to Assignments
   - Click "Assign Worker"
   - Select job and worker
   - Change status to test updates

4. **Mark Attendance**:
   - Navigate to Attendance
   - Select date
   - Mark check-in/out times
   - Verify hours calculation

5. **Create Payment**:
   - Navigate to Payments
   - Click "Create Payment"
   - Fill amount and status
   - Test status filters

## 📱 Responsive Design

- ✅ Desktop: Full sidebar layout
- ✅ Tablet: Collapsible sidebar
- ✅ Mobile: Hamburger menu navigation
- ✅ All tables responsive and scrollable

## 🚀 Deployment

### Vercel (Recommended)
```bash
git push origin main
# Auto-deploys from Vercel
```

### Manual Deployment
```bash
npm run build
npm run start
```

## 🔒 Security Checklist

- ✅ Firebase Auth protection
- ✅ Admin role verification
- ✅ Security rules on database
- ✅ Input validation with Zod
- ✅ Environment variables for secrets
- ✅ Protected routes with AdminGuard

## 🐛 Troubleshooting

### Firebase Connection Error
- Check `.env.local` values
- Verify Firebase project is active
- Check Security Rules allow reads/writes

### Auth Not Working
- Clear browser cache
- Check Firebase Email/Password auth is enabled
- Verify user exists in Firebase

### Real-time Updates Not Syncing
- Check Firebase connection in browser console
- Verify database path permissions
- Check security rules

### Data Not Saving
- Check network tab in DevTools
- Verify Firebase write permissions
- Check data validation in form

## 📞 Support

For issues:
1. Check console for error messages
2. Verify Firebase configuration
3. Check security rules
4. Inspect network requests

## 📚 Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [React Docs](https://react.dev)

## 📝 Notes

- All timestamps stored as Unix milliseconds
- Currency in Indian Rupees (₹)
- Real-time sync active on all collections
- Toast notifications for user feedback
- Dates stored as YYYY-MM-DD format for attendance

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-23  
**Built with**: Next.js 16.2.6 + Firebase + React 19
