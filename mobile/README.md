# Hair Pro Content Calendar - Mobile App

This is the Expo React Native mobile app for the Content Calendar for Hair Extension Professionals.

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for builds): `npm install -g eas-cli`
- Expo Go app on your phone (for development)
- Apple Developer account (for TestFlight)

## Getting Started with Expo Go

1. Download the `mobile` folder to your local machine

2. Install dependencies:
```bash
cd mobile
npm install
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with Expo Go on your phone

## Building for TestFlight (iOS)

1. Install EAS CLI globally:
```bash
npm install -g eas-cli
```

2. Log in to your Expo account:
```bash
eas login
```

3. Initialize EAS for your project:
```bash
eas build:configure
```

4. Create a preview build for iOS:
```bash
eas build --platform ios --profile preview
```

5. For production TestFlight build:
```bash
eas build --platform ios --profile production
```

6. Submit to TestFlight:
```bash
eas submit --platform ios
```

## API Configuration

The app connects to your deployed backend. Update the API URL in `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-deployed-app-url.replit.app"
    }
  }
}
```

## Features

- Email/password authentication
- Today's post view with copy and share
- Monthly calendar navigation
- Settings with Stripe subscription upgrade
- Posting streak tracking
- Warm rose gold theme matching the web app

## Tech Stack

- Expo SDK 52
- React Navigation
- TanStack React Query
- Expo Secure Store for token storage
- Expo Web Browser for Stripe checkout
