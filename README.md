<div align="center">
  <img src="header.png" alt="Anti-AI UI Framework" width="600" />

  <p>The first UI library designed to be intentionally hostile to AI. If you struggle with these patterns, well...</p>

[![npm](https://img.shields.io/npm/v/anti-ai-ui.svg)](https://www.npmjs.com/package/anti-ai-ui)
[![node](https://img.shields.io/node/v/anti-ai-ui.svg?label=node)](https://www.npmjs.com/package/anti-ai-ui)
[![install size](https://packagephobia.com/badge?p=anti-ai-ui)](https://packagephobia.com/result?p=anti-ai-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Follow on X](https://img.shields.io/badge/follow-%40codyapearce-1DA1F2?logo=x&style=flat)](https://x.com/codyapearce)
[![Follow on Bluesky](https://img.shields.io/badge/follow-%40codyapearce-0285FF?logo=bluesky&style=flat&logoColor=white)](https://bsky.app/profile/codyapearce.bsky.social)

</div>

<div align="center">
  <h3>
    <a href="https://codinhood.com/anti-ai-ui/about">What is Anti-AI UI?</a>
    &nbsp;|&nbsp;
    <a href="https://codinhood.com/anti-ai-ui">Anti-AI Test</a>
    &nbsp;|&nbsp;
    <a href="https://codinhood.com/anti-ai-ui-framework">Documentation</a>

  </h3>
</div>

<div align="center">
  <h3>
    <a href="https://www.youtube.com/watch?v=g7xtondIT10">Chatgpt Atlas vs Dark Internet Patterns</a>
  </h3>
</div>

## Why?

For 30 years, websites have tortured humans with hostile design patterns.

Microscopic close buttons. Fake download links. Cookie consent mazes. Passwords that demand uppercase, lowercase, a number, a symbol, and the blood of your firstborn.

We adapted. We learned to distrust interfaces. We developed the muscle memory to find the real X button.

Now AI browsers can move a mouse and click buttons. They can fill out forms. They can navigate the web.

But can they handle the patterns we've been suffering through for decades?

**This framework lets you find out.**

20 components. Buttons that run away. Forms that rotate. Labels that lie. Cookie banners nested five layers deep.

Everything humans have endured and some specifically created to frustrate AI browsers. Now available as React components and vanilla JS.

---

## Install

```bash
npm install anti-ai-ui
```

React is optional. Vanilla JavaScript implementations included for all components. jQuery is not optional.

---

## Quick Start

### React

```tsx
import { RunawayButton, PasswordHell, CookieHell } from 'anti-ai-ui';

function App() {
  return (
    <>
      <RunawayButton onCatch={() => console.log('Caught!')}>
        Click me if you can
      </RunawayButton>

      <PasswordHell onValidPassword={(pw) => console.log('Valid:', pw)} />

      <CookieHell depth={5} onAcceptAll={() => console.log('Accepted')} />
    </>
  );
}
```

### Vanilla JavaScript

```typescript
import { createRunawayButton, createPasswordHell } from 'anti-ai-ui/vanilla';

const cleanup = createRunawayButton({
  container: document.getElementById('app'),
  label: 'Click me if you can',
  onCatch: () => console.log('Caught!'),
});

// Later: cleanup()
```

### jQuery

```javascript
$('#submit-btn').each(function () {
  createRunawayButton({
    container: $(this).parent()[0],
    element: this,
    onCatch: () => $('#form').submit(),
  });
});

createCookieHell({
  container: $('body')[0],
  depth: 4,
  onAcceptAll: () => $.cookie('consent', 'true'),
});
```

---

## Components

### Interaction

| Component         | Description                               |
| ----------------- | ----------------------------------------- |
| **RunawayButton** | Evades cursor interaction                 |
| **MitosisButton** | Splits into multiple buttons when clicked |
| **GravityField**  | Elements respond to cursor proximity      |

### Forms

| Component                 | Description                         |
| ------------------------- | ----------------------------------- |
| **PasswordHell**          | Validation requirements that evolve |
| **FormChaos**             | Rotation and scale transformations  |
| **MarqueeInputs**         | Fields that move while typing       |
| **LabelPositionSwap**     | Labels that swap positions          |
| **ShiftingInterface**     | Elements that shift randomly        |
| **TabIndexRandomization** | Randomized tab order                |
| **ThreeFormCarousel**     | Rotating form carousel              |

### Overlays

| Component             | Description             |
| --------------------- | ----------------------- |
| **CookieHell**        | Nested consent banners  |
| **PopupChaos**        | Ordered popup dismissal |
| **FloatingBannerAds** | Moving banners          |
| **RandomFakeErrors**  | Periodic error displays |

### Visual

| Component                  | Description                     |
| -------------------------- | ------------------------------- |
| **FakeDownloadGrid**       | One real button among decoys    |
| **GlitchText**             | Text cycling through variations |
| **OpacityFlash**           | Flashing opacity                |
| **MicroscopicCloseButton** | Precision close buttons         |
| **FakeMarqueeFields**      | Scrolling field displays        |

### Semantic

| Component               | Description                |
| ----------------------- | -------------------------- |
| **SemanticGaslighting** | Labels don't match actions |

---

## Utilities

Detection utilities for analyzing interaction patterns:

```typescript
import {
  detectPerfectMovement, // Unnaturally straight cursor paths
  detectExactClicks, // Repetitive click coordinates
  detectTiming, // Suspiciously consistent timing
  detectPatterns, // Automation signatures
} from 'anti-ai-ui/utils';
```

---

## Documentation

Full docs and interactive demos at [codinhood.com/anti-ai-ui-framework](https://codinhood.com/anti-ai-ui-framework).

---

## More Unhinged Projects

- [I Can't Believe It's Not CSS](https://github.com/codypearce/i-cant-believe-its-not-css) - Style websites using SQL instead of CSS. Database migrations for your styles.

---

## License

MIT
