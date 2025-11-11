# RunawayButton

A dynamic button component that implements intelligent cursor evasion patterns to ensure deliberate user interaction.

## Description

The RunawayButton component moves away from the cursor as it approaches, requiring users to demonstrate focus and intent. This pattern is ideal for high-value actions that require conscious user engagement rather than accidental clicks.

## React API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `speed` | `number` | `1` | Speed multiplier for evasion movement. Higher values make the button move faster. Range: 0.5-3 recommended. |
| `evasionDistance` | `number` | `120` | Distance in pixels at which evasion triggers. The button starts moving when cursor enters this radius. |
| `jitter` | `number` | `6` | Random jitter in pixels to add unpredictability to movement and prevent automated tracking. |
| `onCatch` | `(event: React.MouseEvent<HTMLButtonElement>) => void` | `undefined` | Callback fired when the user successfully clicks the button. |
| `className` | `string` | `undefined` | CSS class name to apply to the button element. |
| `style` | `React.CSSProperties` | `undefined` | Inline styles to apply to the button element. |
| `children` | `React.ReactNode` | `'Catch me'` | Button content. |

### Usage

#### Basic Example

```tsx
import { RunawayButton } from 'anti-ai-ui';

function App() {
  return (
    <div style={{ position: 'relative', height: 220 }}>
      <RunawayButton>Catch me</RunawayButton>
    </div>
  );
}
```

#### Advanced Configuration

```tsx
import { RunawayButton } from 'anti-ai-ui';

function PremiumAction() {
  const handleCatch = (event: React.MouseEvent) => {
    console.log('User demonstrated intent!');
    // Process high-value action
  };

  return (
    <div style={{ position: 'relative', height: 300, width: 400 }}>
      <RunawayButton
        speed={1.5}
        evasionDistance={150}
        jitter={10}
        onCatch={handleCatch}
        className="premium-button"
        style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Claim Reward
      </RunawayButton>
    </div>
  );
}
```

## Vanilla JavaScript API

### Function: `makeButtonRunaway(element, options)`

Applies runaway behavior to any HTML element.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `element` | `HTMLElement` | The element to make evasive (typically a button). |
| `options` | `RunawayOptions` | Configuration object. |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `speed` | `number` | `1` | Speed multiplier for evasion movement. |
| `evasionDistance` | `number` | `120` | Distance in pixels at which evasion triggers. |
| `jitter` | `number` | `6` | Random jitter in pixels. |
| `container` | `HTMLElement` | `element.parentElement` | Container element for positioning bounds. |

#### Returns

`() => void` - Cleanup function to remove event listeners and restore element.

#### Usage

```javascript
import { makeButtonRunaway } from 'anti-ai-ui/vanilla';

const button = document.getElementById('myButton');
const cleanup = makeButtonRunaway(button, {
  speed: 1.2,
  evasionDistance: 130,
  jitter: 8,
  container: document.getElementById('container')
});

// Later, when removing the component:
cleanup();
```

#### Complete HTML Example

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    #container {
      position: relative;
      height: 300px;
      width: 400px;
      border: 2px solid #ccc;
      background: #f5f5f5;
    }
    #runawayBtn {
      padding: 12px 24px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div id="container">
    <button id="runawayBtn">Catch Me</button>
  </div>

  <script type="module">
    import { makeButtonRunaway } from 'anti-ai-ui/vanilla';

    const button = document.getElementById('runawayBtn');
    const container = document.getElementById('container');

    makeButtonRunaway(button, { container });

    button.addEventListener('click', () => {
      alert('You caught it!');
    });
  </script>
</body>
</html>
```

## Implementation Details

### Evasion Algorithm

The component uses sophisticated physics-based evasion:

1. **Threat Detection**: Monitors cursor position relative to button
2. **Distance Calculation**: Triggers when cursor enters evasion radius
3. **Vector Calculation**: Calculates escape vector away from cursor
4. **Corner Detection**: Detects when cornered and calculates escape routes
5. **Jitter Application**: Adds randomness to prevent predictable patterns
6. **Bounds Constraint**: Keeps button within container boundaries

### Performance Considerations

- Uses CSS transforms for smooth 60fps animation
- Event throttling prevents excessive calculations
- Minimal re-renders in React implementation
- Cleanup functions prevent memory leaks

## Best Practices

### Container Setup

Always wrap the RunawayButton in a positioned container:

```tsx
// ✅ Correct
<div style={{ position: 'relative', height: 300 }}>
  <RunawayButton>Click me</RunawayButton>
</div>

// ❌ Incorrect - button may escape viewport
<RunawayButton>Click me</RunawayButton>
```

### Accessibility Considerations

While this component creates an intentionally challenging interaction, consider:

- Providing alternative interaction methods for users who require them
- Adding keyboard shortcuts for accessibility
- Including timeout mechanisms that make the button easier to catch over time
- Clearly communicating the interaction pattern

### Tuning Parameters

Adjust based on your use case:

- **Low difficulty**: `speed: 0.5`, `evasionDistance: 80`
- **Medium difficulty**: `speed: 1`, `evasionDistance: 120` (default)
- **High difficulty**: `speed: 1.5`, `evasionDistance: 150`
- **Extreme difficulty**: `speed: 2`, `evasionDistance: 180`

## TypeScript

Import types for full IntelliSense support:

```typescript
import type { RunawayButtonProps } from 'anti-ai-ui/types';
import type { RunawayOptions } from 'anti-ai-ui/types';
```

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 12+)
- Opera: ✅ Full support

## Related Components

- [FakeDownloadGrid](./FakeDownloadGrid.md) - Multiple decoy buttons
- [MitosisButton](./MitosisButton.md) - Self-replicating button clones

