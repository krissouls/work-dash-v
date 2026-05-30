# Backend API Routes Documentation

This dashboard includes secure server-side API endpoints that use Firebase Admin SDK. All endpoints require authentication with a valid Firebase ID token.

## Setup

### 1. Download Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **workdash-v** project
3. Settings (⚙️) → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file securely

### 2. Configure Environment Variable

Add to your `.env.local` (NEVER commit this):

```bash
# Copy the entire serviceAccountKey.json content as JSON string
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"workdash-v",...}'
```

Or if using file path:
```bash
# Alternative: reference the file path
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
```

## Available Endpoints

All endpoints require: `Authorization: Bearer <idToken>` header

### 1. Bulk Update Workers

**POST** `/api/workers/bulk-update`

Update multiple worker records at once.

**Request:**
```json
{
  "workers": [
    {
      "id": "worker-1",
      "salary": 25000,
      "status": "active",
      "department": "construction"
    },
    {
      "id": "worker-2",
      "salary": 30000,
      "status": "on-leave"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Updated 2 workers",
  "count": 2
}
```

---

### 2. Process Payments

**POST** `/api/payments/process`

Mark payments as completed in bulk.

**Request:**
```json
{
  "paymentIds": ["payment-1", "payment-2", "payment-3"],
  "status": "completed",
  "processedAt": "2024-05-31T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Processed 3 payments",
  "count": 3,
  "status": "completed"
}
```

---

### 3. Bulk Mark Attendance

**POST** `/api/attendance/bulk-mark`

Record attendance for multiple workers.

**Request:**
```json
{
  "records": [
    {
      "workerId": "worker-1",
      "date": "2024-05-31",
      "status": "present",
      "checkIn": "09:00",
      "checkOut": "17:30",
      "hours": 8.5,
      "notes": "Regular shift"
    },
    {
      "workerId": "worker-2",
      "date": "2024-05-31",
      "status": "absent",
      "notes": "Medical leave"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Marked attendance for 2 records",
  "count": 2
}
```

---

## Authentication Example

### Using the Dashboard

Tokens are automatically obtained from Firebase Auth when users log in. Use them in API calls:

```typescript
// In your dashboard components
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
const token = await user?.getIdToken();

// Make API call
const response = await fetch('/api/workers/bulk-update', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ workers: [...] }),
});
```

### Using cURL (for testing)

```bash
curl -X POST http://localhost:3000/api/workers/bulk-update \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"workers":[{"id":"w-1","salary":25000}]}'
```

---

## Error Handling

All endpoints return standard error responses:

**401 Unauthorized:**
```json
{
  "error": "Token verification failed: ID token has expired"
}
```

**400 Bad Request:**
```json
{
  "error": "Invalid workers array"
}
```

**500 Server Error:**
```json
{
  "error": "Database operation failed"
}
```

---

## Security Notes

✅ **What's protected:**
- All API endpoints verify Firebase ID token server-side
- Service account credentials never exposed to client
- Each request requires fresh authentication

⚠️ **Important:**
- Never store `serviceAccountKey.json` in git
- Keep `.env.local` in `.gitignore`
- Rotate service account keys periodically
- Use strict Firebase Security Rules in production

---

## Adding More Endpoints

Template for new secure endpoints:

```typescript
// app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { protectedRoute } from "@/lib/api-middleware";
import { db } from "@/lib/firebase-admin";

async function handler(request: NextRequest, user: any) {
  try {
    const data = await request.json();
    
    // Your logic here
    const result = await db.ref('your-path').update(data);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const POST = protectedRoute(handler);
```

---

## Deployment

When deploying to Vercel/Cloud Run:

1. Add `FIREBASE_SERVICE_ACCOUNT_JSON` to environment variables
2. Use the entire serviceAccountKey.json as the value
3. Never commit credentials to git
4. Use separate service accounts for dev/prod environments

