# anti-ai-ui + Vite + React Example

This example demonstrates how to use `anti-ai-ui` in a modern Vite + React application.

## Features

- ⚡ Lightning-fast HMR with Vite
- ⚛️ React 18 with TypeScript
- 🤖 All anti-ai-ui components
- 🎨 Professional styling with gradients
- 📦 Optimized production builds

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Components Included

- RunawayButton - Button that evades the cursor
- CookieHell - Nested cookie consent banners
- FakeDownloadGrid - Grid with fake download buttons
- PopupChaos - Multiple popups with ordered closing
- PasswordHell - Ever-changing password requirements
- ShiftingInterface - Form elements that move around
- SemanticGaslighting - Buttons that do the opposite
- MarqueeInputs - Moving input fields

## Development

The example uses `anti-ai-ui` as a local file dependency (`file:../..`), so any changes to the main library will be reflected after rebuilding.

To link the local package:

```bash
# From the root of anti-ai-ui
npm run build

# From this directory
npm install
npm run dev
```

## Vite Benefits

- Instant server start
- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ES modules in development
- Tree-shaking and code-splitting
