# MitosisButton

A button that duplicates itself on click, spawning decoys. Only one is real; the real identity rotates or randomizes as clones appear. Great for playful chaos and bot-confusing decoys.

## React Usage

```tsx
import { MitosisButton } from 'anti-ai-ui';

<MitosisButton
  maxClones={8}
  decayMs={6000}
  realIndexStrategy="rotate"
  onRealClick={() => console.log('Real!')}
  onFakeClick={() => console.log('Decoy...')}
  style={{ padding: '10px 14px' }}
>
  Click me
 </MitosisButton>
```

### Props
- maxClones: number — Max clones (excluding the real one). Default: 8.
- initialClones: number — Spawn this many decoys on mount. Default: 0.
- realStartsRandom: boolean — If true and there are clones initially, the real button starts random (not always the seed). Default: false.
- shuffleIntervalMs: number — Reassign which one is real every N ms (0 disables). Default: 0.
- decayMs: number — Clone lifetime before disappearing. Default: 6000ms.
- realIndexStrategy: 'rotate' | 'random' — How the real identity moves. Default: 'rotate'.
- onRealClick(event): called when the real button is clicked.
- onFakeClick(event, index): called when a decoy is clicked.
- className, style, children: standard customization.

## Vanilla Usage

```html
<div id="zone" style="position:relative;height:220px">
  <button id="seed">Click me</button>
</div>
<script type="module">
  import { makeMitosisButton } from 'anti-ai-ui/vanilla';
  const cleanup = makeMitosisButton(document.getElementById('seed'), {
    maxClones: 8,
    decayMs: 6000,
    realIndexStrategy: 'rotate',
    onRealClick: () => console.log('Real!'),
    onFakeClick: () => console.log('Decoy...'),
  });
</script>
```

## Notes
- Clones are placed within the container using percentage positions; ensure the container has dimensions and `position: relative`.
- Best Practices: This component is ideal for gamification, engagement challenges, and interactive verification flows where user attention and intent need to be confirmed.
- Accessibility: Consider providing alternative interaction methods for users who may require them, or implementing a timeout mechanism that simplifies the interaction after a period.
