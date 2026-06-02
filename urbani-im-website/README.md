# Urbani IM Website

A modern, mobile-first landing page for Urbani IM application.

## Features

- ✨ Mobile-first responsive design
- ⚡ Built with Next.js 16 and React 19
- 🎨 Styled with Tailwind CSS
- 🚀 Fast performance and SEO optimized
- 📱 One-click download links for App Store and Google Play

## Getting Started

### Prerequisites

- Node.js 18+ or later
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
urbani-im-website/
├── app/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── public/               # Static assets
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Configuration

### App Links

Update the download links in `app/page.tsx`:

- App Store: Replace `https://apps.apple.com`
- Google Play: Replace `https://play.google.com`

## License

Private project - Urbani IM
