# Firebase Setup Guide

Follow these steps to set up Firebase for your authentication panel:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `authentication-panel-login-anim`
4. Disable Google Analytics (or enable if you want)
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your preferred location
5. Click "Done"

## 3. Get Firebase Configuration

1. In your Firebase project console, click the gear icon ⚙️
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click "Web" icon (</>) to add a web app
5. Register your app with name: `Authentication Panel`
6. Copy the Firebase configuration object

## 4. Update Firebase Configuration

1. Open `src/config/firebase.ts`
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
  measurementId: "your-measurement-id" // Optional
};
```

## 5. Set Up Firestore Security Rules (Optional)

For development, you can use these basic rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note**: For production, implement proper security rules!

## 6. Initialize Sample Data (Optional)

The app will automatically create users when they sign up. You can also manually add an admin user:

1. Go to Firestore Database in Firebase Console
2. Create a collection called `users`
3. Add a document with:
```json
{
  "email": "uday@admin.com",
  "name": "Uday Rastogi",
  "role": "admin",
  "password": "admin123",
  "isEmailVerified": true,
  "isPhoneVerified": false,
  "createdAt": "2025-08-21T10:30:00Z"
}
```

## 7. Test the Integration

1. Start your development server: `npm run dev`
2. Try signing up a new user
3. Login as admin with: `uday@admin.com` / `admin123`
4. Check the Admin Dashboard for Firebase data
5. Verify data is being stored in Firestore Console

## Features Enabled with Firebase

### ✅ Data Persistence
- User data stored in Firestore
- Real-time data synchronization
- Persistent user sessions

### ✅ Admin Dashboard
- View all users from Firebase
- Delete users
- Change user roles
- Activity logging
- System statistics

### ✅ Activity Tracking
- User login/logout tracking
- Profile updates logging
- Admin actions logging
- Real-time activity monitoring

### ✅ Scalable Architecture
- Cloud-based storage
- Real-time updates
- Production-ready infrastructure

## Environment Variables (Optional)

For better security, you can use environment variables:

1. Create `.env` file in your project root
2. Add your Firebase config:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

3. Update `firebase.ts` to use environment variables:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

## Troubleshooting

### Common Issues:

1. **"Firebase not found" error**: Make sure you've installed firebase: `npm install firebase`

2. **"Firestore permissions denied"**: Check your Firestore security rules

3. **"Invalid configuration"**: Verify your Firebase config values are correct

4. **"Network error"**: Ensure your internet connection is stable

### Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Firebase project settings
3. Ensure Firestore is enabled and configured
4. Check the Firebase Console for any error logs

---

Your authentication panel now uses Firebase for data storage and real-time features! 🚀
