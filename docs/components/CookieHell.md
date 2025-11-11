# CookieHell

Chaotic cookie consent overlay with nested toggles.

Props
- `depth?: number`, `toggleCount?: number`, `rejectButtonSize?: number`
- `onAcceptAll?: () => void`, `onRejectAll?: () => void`, `onClose?: () => void`

Usage
```tsx
{open && <CookieHell depth={3} toggleCount={4} onClose={() => setOpen(false)} />}
```

