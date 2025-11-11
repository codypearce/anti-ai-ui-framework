# anti-ai-ui

[![npm version](https://img.shields.io/npm/v/anti-ai-ui.svg)](https://www.npmjs.com/package/anti-ai-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/anti-ai-ui/ci.yml?branch=main)](https://github.com/yourusername/anti-ai-ui/actions)

**The industry-standard framework for building automation-resistant user interfaces.**

anti-ai-ui is a comprehensive toolkit for creating UI components that are resilient against AI browsers, automated scraping, and bot interactions. Built with modern web standards, it provides both React components and vanilla JavaScript utilities for implementing proven UX patterns that prioritize human interaction.

## Table of Contents

- [Why anti-ai-ui?](#why-anti-ai-ui)
- [Install](#install)
- [Quick Start (React)](#quick-start-react)
- [Quick Start (Vanilla)](#quick-start-vanilla)
- [Components (React)](#components-react)
- [Vanilla APIs](#vanilla-apis)
- [Bot Detection Utilities](#bot-detection-utilities)
- [Demo](#demo)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

## Why anti-ai-ui?

In an era of increasing automation, many applications require genuine human interaction. anti-ai-ui provides battle-tested components that ensure your interfaces remain accessible to real users while maintaining resilience against automated systems.

**Key Benefits:**

- **Production-Ready**: Thoroughly tested across browsers and devices
- **TypeScript First**: Full type safety and IntelliSense support
- **Framework Agnostic**: Use with React or vanilla JavaScript
- **Zero Dependencies**: Lightweight with no external runtime dependencies
- **Customizable**: Extensive configuration options for every component
- **Accessible**: Maintains keyboard navigation and proper semantics

**Use Cases:**

- High-value transaction flows requiring human verification
- Content protection and rate limiting
- User engagement optimization
- Interactive verification systems
- Premium content gating

## Install

```
npm install anti-ai-ui
```

React peers are optional; you only need them if using the React components.

## Quick Start (React)

```tsx
import { RunawayButton, FakeDownloadGrid } from 'anti-ai-ui';

export default function App() {
  return (
    <div style={{ height: 240 }}>
      <RunawayButton evasionDistance={140} jitter={8}>
        Catch me
      </RunawayButton>
      <FakeDownloadGrid
        rows={3}
        cols={4}
        onRealClick={() => alert('You found it!')}
      />
    </div>
  );
}
```

## Quick Start (Vanilla)

```html
<div id="box" style="position:relative;height:220px">
  <button id="btn">Catch me</button>
</div>
<script type="module">
  import { makeButtonRunaway } from 'anti-ai-ui/vanilla';
  makeButtonRunaway(document.getElementById('btn'), {
    container: document.getElementById('box'),
  });
  // More: makeFakeDownloadGrid, makeCookieHell, makePopupChaos, makePasswordHell, makeShiftingInterface, makeSemanticGaslighting
  // import from 'anti-ai-ui/vanilla'
  // utils from 'anti-ai-ui/utils'
</script>
```

## Components (React)

- RunawayButton: `speed?`, `evasionDistance?`, `jitter?`, `onCatch?`, `className?`, `style?`
- FakeDownloadGrid: `rows?`, `cols?`, `realButtonIndex?`, `labels?`, `onRealClick?`, `onFakeClick?`
- CookieHell: `depth?`, `toggleCount?`, `rejectButtonSize?`, `onAcceptAll?`, `onRejectAll?`, `onClose?`
- PopupChaos: `popupCount?`, `closeOrder?`, `onAllClosed?`
- PasswordHell: `requirementChangeInterval?`, `onSubmit?`, `rules?`, `freezeRules?`
- ShiftingInterface: `shiftInterval?`, `duplicateChance?`, `colorChangeInterval?`
- SemanticGaslighting: `buttons`, `onSubmit?`, `onCancel?`, `onReset?`, `onAction?`
- MitosisButton: `maxClones?`, `initialClones?`, `realStartsRandom?`, `shuffleIntervalMs?`, `decayMs?`, `realIndexStrategy?`, `onRealClick?`, `onFakeClick?`, `className?`, `style?`

See `src/types` or `anti-ai-ui/types` subpath for full TypeScript types.

## Vanilla APIs

- makeButtonRunaway(el, opts)
- makeFakeDownloadGrid(container, opts)
- makeCookieHell(opts)
- makePopupChaos(opts)
- makePasswordHell(container, opts)
- makeShiftingInterface(container, opts)
- makeSemanticGaslighting(container, opts)
- makeMitosisButton(buttonEl, opts)

## Bot Detection Utilities

Import from `anti-ai-ui/utils`:

- PerfectMovementDetector, detectPerfectMovement
- ExactClickDetector, detectExactClick
- TimingDetector, measureReactionTime
- PatternDetector, analyzeSequence
- randomPosition helpers; evasionLogic; logger utilities

## Demo

Run `npm run demo` then visit:

- **Vanilla JS**: http://localhost:4000/examples/
- **React**: http://localhost:4000/examples/react.html
- **HTMX**: http://localhost:4000/examples/htmx.html
- **jQuery**: http://localhost:4000/examples/jquery.html
- **All Components**: http://localhost:4000/examples/all.html

## Troubleshooting

### Components not rendering

Ensure you have installed peer dependencies if using React components:

```bash
npm install react react-dom
```

### TypeScript errors with imports

Make sure your `tsconfig.json` has `"moduleResolution": "node"` and `"esModuleInterop": true`.

### Button moves but won't catch

Check that the container element has `position: relative` or `position: absolute` for proper positioning.

### Events not firing in vanilla JS

Ensure you're calling the cleanup function when removing components:

```javascript
const cleanup = makeButtonRunaway(el, options);
// Later, when removing:
cleanup();
```

### Build errors with tsup

If you encounter issues building from source, ensure you're using Node.js 16+ and have all dev dependencies installed:

```bash
npm install
npm run build
```

## FAQ

### Is this production-ready?

Yes. anti-ai-ui is built with TypeScript, thoroughly tested, and follows industry best practices for component libraries.

### Does this work with Next.js/Remix/other frameworks?

Absolutely. anti-ai-ui works with any React-based framework. For server-side rendering, ensure components are only rendered on the client side.

### Can I customize the appearance?

Yes. All components accept `className` and `style` props. You can fully customize the visual presentation while maintaining the interaction patterns.

### What about accessibility?

Components maintain semantic HTML and keyboard navigation. However, by their nature, these patterns may create challenging experiences for assistive technologies. Use responsibly and provide alternative paths where required.

### How do I contribute a new component?

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on adding components, including required tests and documentation.

### Does this support Vue/Svelte/Angular?

Currently, we provide React components and vanilla JavaScript utilities. Framework adapters for Vue, Svelte, and Angular are on the roadmap.

### What browsers are supported?

anti-ai-ui supports all modern browsers (Chrome, Firefox, Safari, Edge) from the last 2 major versions. IE11 is not supported.

### How large is the bundle?

The core library is lightweight with zero runtime dependencies. Individual components can be imported to minimize bundle size. Run `npm run build:analyze` to see detailed bundle metrics.

## Contributing

PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT - see [LICENSE](./LICENSE) for details.
