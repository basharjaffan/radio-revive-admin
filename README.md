# Radio Revive - Admin Portal

Admin portal för att hantera radio-enheter i butiker.

## Features

- 📱 Device management (play, pause, volume, restart)
- 👥 User management  
- 📊 Dashboard med analytics
- 🔄 Bulk operations
- 📡 WiFi & Network configuration
- 🔄 System updates

## Tech Stack

- Next.js 15
- Firebase/Firestore
- TypeScript
- Tailwind CSS
- shadcn/ui

## Setup

1. Clone repository:
```bash
git clone https://github.com/YOUR_USERNAME/radio-revive-admin.git
cd radio-revive-admin
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/radio-revive-admin)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run cleanup-devices` - Remove duplicate devices
- `npm run list-devices` - List all devices
- `npm run sync-groups` - Sync group device counts

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |

## License

MIT
