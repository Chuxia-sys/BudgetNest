# Budget Nest - Smart Expense Tracking Web Application

A modern, responsive expense tracking application built with Next.js 16, Firebase Firestore, and shadcn/ui components.

## 🚀 Features

### 1. User Authentication
- Email/Password authentication via Firebase Auth
- Google Sign-In support
- Session persistence
- Protected routes with automatic redirects

### 2. Expense Management
- Add expenses with amount, category, date, and optional notes
- 8 predefined expense categories with icons and colors
- Custom category support
- Delete and manage expenses
- Real-time data synchronization with Firestore

### 3. Dashboard
- Monthly spending overview
- Total spent and transaction count
- Monthly budget limit tracking
- Top spending category display
- Recent expenses list
- Spending alerts when approaching budget limits

### 4. Reports & Analytics
- **Pie Chart**: Spending breakdown by category
- **Bar Chart**: Daily expenses in a month
- **Line Chart**: Spending trends over 6 months
- Monthly expense history
- Export to CSV functionality
- Month-by-month data filtering

### 5. Savings Goals
- Create multiple savings goals
- Set target amounts and deadlines
- Track progress with visual indicators
- Quick add savings feature
- Days remaining countdown
- Overdue goal highlighting

### 6. Settings
- Monthly spending limit configuration
- Spending alerts (80% and 100% threshold)
- Currency selection (USD, EUR, GBP, JPY, CAD, AUD, INR, CNY)
- Account information display

### 7. UI/UX Features
- Modern, professional design with gradient accents
- Dark/Light mode toggle
- Fully responsive (mobile, tablet, desktop)
- Smooth transitions and animations
- Sticky navigation with mobile menu
- Intuitive card-based layouts
- Color-coded categories

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Theme**: next-themes

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── expenses/          # Expense CRUD operations
│   │   ├── categories/        # Category management
│   │   ├── goals/             # Savings goals
│   │   └── settings/          # User settings
│   ├── auth/page.tsx          # Login/Signup page
│   ├── page.tsx               # Dashboard
│   ├── add-expense/           # Add expense form
│   ├── reports/               # Reports & analytics
│   ├── goals/                 # Savings goals page
│   ├── settings/              # Settings page
│   ├── layout.tsx             # Root layout with providers
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── Navigation.tsx         # App navigation
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── lib/
│   ├── firebase.ts            # Firebase configuration
│   └── utils.ts               # Utility functions
└── types/
    └── index.ts               # TypeScript types
```

## 🔧 Setup Instructions

### 1. Firebase Configuration

Create a `.env.local` file in the root directory and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

To get your Firebase credentials:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password and Google providers)
4. Create a Firestore database
5. Go to Project Settings → General → Your apps → Web app
6. Copy the configuration values

### 2. Firestore Security Rules

Set up your Firestore security rules in the Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /expenses/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /categories/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /goals/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /settings/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 3. Run the Application

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

The application will be available at `http://localhost:3000`

## 📊 Database Schema

### Users Collection Structure
```
users/
  {uid}/
    expenses/
      {expenseId}
        - amount: number
        - category: string
        - date: string (YYYY-MM-DD)
        - note: string (optional)
        - createdAt: number (timestamp)
    
    categories/
      {categoryId}
        - name: string
        - color: string
        - icon: string
    
    goals/
      {goalId}
        - title: string
        - targetAmount: number
        - currentAmount: number
        - deadline: string
        - createdAt: number
    
    settings/
      config/
        - spendingLimit: number
        - notificationsEnabled: boolean
        - currency: string
```

## 🎨 Predefined Categories

| ID | Name | Icon | Color |
|----|------|------|-------|
| food | Food | 🍔 | #ef4444 |
| transport | Transport | 🚗 | #f97316 |
| bills | Bills | 📄 | #eab308 |
| shopping | Shopping | 🛍️ | #22c55e |
| entertainment | Entertainment | 🎮 | #06b6d4 |
| health | Health | 💊 | #3b82f6 |
| education | Education | 📚 | #8b5cf6 |
| other | Other | 📦 | #6b7280 |

## 🔑 Key Features Implementation

### Authentication Flow
- Users are redirected to `/auth` if not logged in
- Session persistence via Firebase Auth
- Protected API routes check user UID

### Spending Alerts
- Warning alert at 80% of monthly budget
- Critical alert at 100% of monthly budget
- Configurable in Settings

### Data Visualization
- Recharts library for responsive charts
- Three chart modes: Category Pie, Daily Bar, Trend Line
- Interactive tooltips with formatted values

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Collapsible navigation menu for mobile
- Responsive grid layouts
- Touch-friendly buttons and inputs

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Firebase Hosting
```bash
# Build the application
bun run build

# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

## 📝 Future Enhancements

- [ ] Push notifications via Firebase Cloud Messaging
- [ ] Recurring expenses feature
- [ ] Budget categories with individual limits
- [ ] Expense sharing between users
- [ ] Receipt image upload (VLM)
- [ ] AI-powered spending insights
- [ ] Multi-currency support with real-time conversion
- [ ] Export to PDF reports
- [ ] Data import/export functionality
- [ ] Advanced filtering and search

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Support

For issues and questions, please open an issue in the repository.
