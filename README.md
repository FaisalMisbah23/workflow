# FYP Mobile Application

A React Native Expo mobile application for task and team management, built with Expo Router, TypeScript, and NativeWind.

## Features

- User authentication (sign up, sign in)
- Organization creation
- Task management with priority assignment
- Team collaboration and invites
- Profile management with avatar upload

## Tech Stack

- **Framework**: Expo SDK 54, React Native 0.81, React 19
- **Navigation**: Expo Router (file-based routing)
- **Styling**: Tailwind CSS via NativeWind
- **State Management**: React Context API (UserContext)
- **Backend**: Supabase (Authenication, Database, Edge Functions, Storage)
- **Language**: TypeScript (strict mode)

## Project Structure

```
client/
├── app/                    # Expo Router screens
│   ├── (tabs)/           # Main tab navigation screens
│   ├── _layout.tsx       # Root stack layout
│   ├── index.tsx         # Landing page
│   ├── signin.tsx, signup.tsx  # Auth screens
│   ├── createorganization.jsx  # Org creation
│   ├── createtask.tsx    # Task creation
│   └── info.tsx          # Profile info
├── assets/
│   ├── images/           # App icons, splash, logos
│   └── styles/
│       └── global.css    # Tailwind directives
├── components/           # Reusable UI components
├── constants/            # App constants (TeamMembers, etc.)
├── context/              # React Context providers (UserContext)
├── lib/                  # Supabase client initialization
├── supabase/             # Supabase Edge Functions (send-invite)
├── tests/                # Test suite (pending addition)
├── docs/                 # Project documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── CONTRIBUTING.md
│   ├── DEVELOPMENT.md
│   ├── STYLING.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   ├── REFACTORING_PLAN.md
│   └── README.md
├── .env                  # Environment variables (EXPO_PUBLIC_*)
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── metro.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo Go app (mobile) or emulator
- Supabase project (for backend)

### Installation

1. Clone the repository
2. Navigate to the `client` directory
3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure environment variables:

   Copy `.env` to `.env.local` (optional) or edit `.env` with your Supabase credentials:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   RESEND_API_KEY=your_resend_key
   ```

5. Start the development server:

   ```bash
   npx expo start
   ```

   Scan the QR code with Expo Go (Android) or run on simulator.

### Available Scripts

- `npm start` – Start Expo development server
- `npm run android` – Start on Android emulator
- `npm run ios` – Start on iOS simulator
- `npm run web` – Start in web browser
- `npm run lint` – Run ESLint

## Documentation

- [Architecture](docs/ARCHITECTURE.md) – High-level design and data flow
- [API Reference](docs/API.md) – API endpoints and usage
- [Development Guide](docs/DEVELOPMENT.md) – Setup and contribution workflow
- [Styling Guide](docs/STYLING.md) – Tailwind and NativeWind patterns
- [Testing](docs/TESTING.md) – Testing strategy
- [Deployment](docs/DEPLOYMENT.md) – Build and release process
- [Refactoring Plan](docs/REFACTORING_PLAN.md) – Ongoing code improvements
- [Docs Index](docs/README.md) – Full documentation index

## Notes

- This project uses [Expo Router](https://expo.github.io/router/) for file-based navigation.
- Styling uses [NativeWind](https://www.nativewind.dev/) v4 with Tailwind CSS.
- State management is handled via React Context in `context/UserContext.jsx`.
- Backend services are provided by Supabase; ensure RLS policies are configured.

## License

This project is private and not licensed for public use.
