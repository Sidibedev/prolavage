# Prolavage - Car Wash Management App

A mobile application built with React Native and Expo for managing car wash operations.

## Features

### Authentication
- **Login Screen**: Phone and 4-digit PIN authentication
- **Blocked Screen**: Handle blocked user accounts with WhatsApp contact option

### Core Functionality
- **Home Screen**: Display daily statistics (washes and revenue)
- **New Wash Screen**: Create new wash records with client search/creation
- **Confirmation Screen**: Show wash summary with WhatsApp sharing
- **History Screen**: View all wash records
- **Stats Screen**: Comprehensive statistics (today, week, month)

### Client Management
- Search existing clients by name, phone, or license plate
- Create new clients on the fly
- Store client information (name, phone, plate)

### Services & Payments
- Multiple service types: Exterior, Interior, Full, Custom
- Payment methods: Cash, Wave, Orange Money
- Automatic pricing with custom price option

## Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router with tab-based navigation
- **State Management**: Zustand
- **Backend**: PocketBase
- **Storage**: AsyncStorage for authentication persistence
- **Icons**: Lucide React Native

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── login.tsx          # Login screen
│   ├── blocked.tsx        # Blocked user screen
│   ├── confirmation.tsx   # Wash confirmation screen
│   └── _layout.tsx        # Root navigation layout
├── screens/               # Screen components
│   ├── LoginScreen.tsx
│   ├── BlockedScreen.tsx
│   ├── HomeScreen.tsx
│   ├── NewWashScreen.tsx
│   ├── ConfirmationScreen.tsx
│   ├── HistoryScreen.tsx
│   └── StatsScreen.tsx
├── components/            # Reusable components
│   └── LoadingScreen.tsx
├── services/              # API and external services
│   └── api.ts            # PocketBase client
├── store/                 # State management
│   └── auth.ts           # Authentication store
├── types/                 # TypeScript type definitions
│   └── index.ts
└── hooks/                 # Custom hooks
    └── useFrameworkReady.ts
```

## Setup Instructions

### 1. PocketBase Configuration

Update the PocketBase URL in `services/api.ts`:

```typescript
const PB_URL = 'https://your-pocketbase-url.com';
```

### 2. Database Schema

Create the following collections in your PocketBase admin:

**Users Collection:**
- phone (text, required)
- name (text, required)  
- status (select: active, blocked)
- Pin-based authentication

**Clients Collection:**
- name (text, required)
- phone (text, optional)
- plate (text, required)

**Washes Collection:**
- user (relation to users)
- client (relation to clients)
- service (select: exterior, interior, full, other)
- price (number, required)
- payment_method (select: cash, wave, om)

### 3. Environment Variables

The app automatically handles PocketBase authentication tokens via AsyncStorage.

### 4. WhatsApp Integration

Update admin phone number in `screens/BlockedScreen.tsx`:

```typescript
const adminPhone = '221773456789'; // Replace with actual admin phone
```

## Key Features Implementation

### Authentication Flow
- Automatic auth state checking on app start
- Persistent login with AsyncStorage
- Automatic redirect to blocked screen for blocked users

### Client Search & Creation
- Real-time client search across name, phone, and license plate
- Seamless client creation during wash creation
- Client data persistence

### Statistics Calculation
- Client-side calculation for real-time stats
- Daily, weekly, and monthly breakdowns
- Service-wise revenue analysis
- Average calculations

### WhatsApp Integration
- Direct messaging to clients with wash details
- Admin contact for blocked users
- Formatted message templates

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for web
npm run build:web
```

## API Integration

The app uses PocketBase for all backend operations:

- **Authentication**: `pb.collection("users").authWithPassword()`
- **Client Management**: `pb.collection("clients").create()`/`.getList()`
- **Wash Records**: `pb.collection("washes").create()`/`.getList()`
- **Statistics**: Client-side aggregation of wash data

## Error Handling

- Automatic detection of blocked users (403/401 responses)
- Network error handling with user-friendly messages
- Form validation and input sanitization
- Loading states throughout the app

## UI/UX Features

- Clean, modern design with consistent styling
- Responsive layout for various screen sizes  
- Loading indicators for async operations
- Empty states with call-to-action buttons
- Toast messages for success/error feedback

This app provides a complete solution for small car wash businesses to manage their operations efficiently with a mobile-first approach.