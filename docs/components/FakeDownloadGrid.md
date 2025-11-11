# FakeDownloadGrid

A grid-based component featuring multiple visually similar buttons, with sophisticated algorithms to differentiate genuine actions from automated interactions.

## Description

The FakeDownloadGrid component renders a configurable grid of buttons where only one triggers the real action. This pattern ensures users carefully evaluate their choices before clicking, making it ideal for premium content delivery, download gates, and engagement verification.

## React API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | `3` | Number of rows in the grid. Range: 1-10. |
| `cols` | `number` | `3` | Number of columns in the grid. Range: 1-10. |
| `realButtonIndex` | `number` | `random` | Fixed index for the real button. If not provided, selected randomly and may shuffle after fake clicks. |
| `labels` | `{ real?: string; fake?: string }` | `{ real: 'DOWNLOAD', fake: 'DOWNLOAD' }` | Labels for real and fake buttons. |
| `onRealClick` | `(index: number, event: React.MouseEvent) => void` | `undefined` | Callback fired when the real button is clicked. |
| `onFakeClick` | `(index: number, event: React.MouseEvent) => void` | `undefined` | Callback fired when a fake button is clicked. |
| `className` | `string` | `undefined` | CSS class name to apply to the grid container. |
| `style` | `React.CSSProperties` | `undefined` | Inline styles to apply to the grid container. |

### Usage

#### Basic Example

```tsx
import { FakeDownloadGrid } from 'anti-ai-ui';

function App() {
  return (
    <FakeDownloadGrid
      rows={3}
      cols={4}
      onRealClick={() => alert('Found!')}
    />
  );
}
```

#### Advanced Configuration

```tsx
import { FakeDownloadGrid } from 'anti-ai-ui';

function DownloadGate() {
  const handleRealClick = (index: number) => {
    console.log(`Correct button clicked at index ${index}`);
    // Initiate real download
    window.location.href = '/api/download/file.pdf';
  };

  const handleFakeClick = (index: number) => {
    console.log(`Fake button clicked at index ${index}`);
    // Optional: track attempted fraud
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Choose the correct download button</h2>
      <FakeDownloadGrid
        rows={4}
        cols={3}
        labels={{
          real: 'DOWNLOAD FILE',
          fake: 'DOWNLOAD FILE'
        }}
        onRealClick={handleRealClick}
        onFakeClick={handleFakeClick}
        style={{
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}
      />
    </div>
  );
}
```

#### Fixed Real Button Position

```tsx
// Real button always at index 5
<FakeDownloadGrid
  rows={3}
  cols={3}
  realButtonIndex={5}
  onRealClick={() => console.log('Success!')}
/>
```

#### Dynamic Shuffling

When `realButtonIndex` is not specified, the real button position shuffles after each fake click, increasing difficulty:

```tsx
// Real button shuffles after every wrong click
<FakeDownloadGrid
  rows={4}
  cols={4}
  onRealClick={() => console.log('You found it!')}
  onFakeClick={(index) => console.log(`Wrong button: ${index}`)}
/>
```

## Vanilla JavaScript API

### Function: `makeFakeDownloadGrid(container, options)`

Creates a download grid in a specified container element.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` | `HTMLElement` | The container element for the grid. |
| `options` | `FakeDownloadGridOptions` | Configuration object. |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `rows` | `number` | `3` | Number of rows in the grid. |
| `cols` | `number` | `3` | Number of columns in the grid. |
| `realButtonIndex` | `number` | `random` | Fixed index for the real button. |
| `labels` | `{ real?: string; fake?: string }` | `{ real: 'DOWNLOAD', fake: 'DOWNLOAD' }` | Button labels. |
| `onRealClick` | `(index: number, event: MouseEvent) => void` | `undefined` | Real button click handler. |
| `onFakeClick` | `(index: number, event: MouseEvent) => void` | `undefined` | Fake button click handler. |

#### Returns

`() => void` - Cleanup function to remove the grid and event listeners.

#### Usage

```javascript
import { makeFakeDownloadGrid } from 'anti-ai-ui/vanilla';

const container = document.getElementById('download-grid');
const cleanup = makeFakeDownloadGrid(container, {
  rows: 3,
  cols: 4,
  onRealClick: (index) => {
    console.log('Real button clicked!');
    window.location.href = '/download';
  },
  onFakeClick: (index) => {
    console.log(`Fake button ${index} clicked`);
  }
});

// Later, when removing:
cleanup();
```

#### Complete HTML Example

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    #grid-container {
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div id="grid-container"></div>

  <script type="module">
    import { makeFakeDownloadGrid } from 'anti-ai-ui/vanilla';

    const container = document.getElementById('grid-container');

    makeFakeDownloadGrid(container, {
      rows: 3,
      cols: 4,
      labels: {
        real: 'DOWNLOAD FILE',
        fake: 'DOWNLOAD FILE'
      },
      onRealClick: () => {
        alert('Correct! Starting download...');
        // Initiate download
      },
      onFakeClick: (index) => {
        console.log(`Advertisement ${index} clicked`);
      }
    });
  </script>
</body>
</html>
```

## Implementation Details

### Button Differentiation

The component uses subtle semantic differences that are meaningful to humans but challenging for automation:

- **ARIA labels**: Real button has `aria-label="Real download"`, fakes have `aria-label="Advertisement"`
- **Visual similarity**: All buttons appear identical to casual inspection
- **Dynamic positioning**: Real button position can shuffle after wrong clicks
- **Event handling**: Different callbacks fire based on button authenticity

### Index Calculation

Grid indices are calculated as `row * cols + col`, starting from 0:

```
Cols:     0    1    2    3
Row 0:  [ 0 ][ 1 ][ 2 ][ 3 ]
Row 1:  [ 4 ][ 5 ][ 6 ][ 7 ]
Row 2:  [ 8 ][ 9 ][10 ][11 ]
```

### Shuffling Behavior

When `realButtonIndex` is undefined:
1. Initial position is random
2. After any fake click, real button moves to new random position
3. Increases difficulty for trial-and-error approaches

## Best Practices

### Download Gate Pattern

```tsx
function SecureDownload() {
  const [attempts, setAttempts] = useState(0);
  const [showGrid, setShowGrid] = useState(true);

  const handleReal = () => {
    setShowGrid(false);
    // Initiate download
    initiateDownload();
  };

  const handleFake = () => {
    setAttempts(prev => prev + 1);
    if (attempts > 5) {
      // Optional: implement rate limiting
      alert('Too many attempts. Please try again later.');
    }
  };

  return showGrid ? (
    <div>
      <p>Attempts: {attempts}</p>
      <FakeDownloadGrid
        rows={3}
        cols={4}
        onRealClick={handleReal}
        onFakeClick={handleFake}
      />
    </div>
  ) : (
    <p>Download started!</p>
  );
}
```

### Accessibility Considerations

- Real buttons use `aria-label="Real download"` for screen readers
- Fake buttons use `aria-label="Advertisement"` to differentiate
- Consider providing alternative access methods for users requiring assistive technology
- Keyboard navigation supported via standard button tabbing

### Grid Size Recommendations

- **Easy**: 2×2 to 3×3 (4-9 buttons)
- **Medium**: 3×4 to 4×4 (12-16 buttons)
- **Hard**: 4×5 to 5×5 (20-25 buttons)
- **Extreme**: 5×6+ (30+ buttons)

Maximum grid size is 10×10 (100 buttons).

### Custom Styling

```tsx
<FakeDownloadGrid
  rows={3}
  cols={3}
  className="custom-grid"
  style={{
    gap: '16px',
    padding: '24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px'
  }}
/>
```

## TypeScript

Import types for full IntelliSense support:

```typescript
import type { FakeDownloadGridProps } from 'anti-ai-ui/types';
import type { FakeDownloadGridOptions } from 'anti-ai-ui/types';
```

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 12+)
- Opera: ✅ Full support

## Related Components

- [RunawayButton](./RunawayButton.md) - Single evasive button
- [MitosisButton](./MitosisButton.md) - Self-replicating button clones
- [PopupChaos](./PopupChaos.md) - Multiple popup modals

