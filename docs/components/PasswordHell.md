# PasswordHell

Password form with evolving, contradictory requirements.

Props
- `requirementChangeInterval?: number`
- `onSubmit?: (password: string) => void`
- `rules?: Rule[]` and `freezeRules?: boolean` (testing)

Usage
```tsx
<PasswordHell requirementChangeInterval={2500} onSubmit={(pw) => console.log(pw)} />
```

