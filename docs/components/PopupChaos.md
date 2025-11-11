# PopupChaos

Multiple overlapping popups that must be closed in a specific order.

Props
- `popupCount?: number`
- `closeOrder?: number[]` – required order of ids
- `onAllClosed?: () => void`

Usage
```tsx
<PopupChaos popupCount={5} />
```

