# SemanticGaslighting

Buttons where labels don’t match what they actually do.

Props
- `buttons: { label: string, actualAction: 'submit' | 'cancel' | 'reset' | 'noop' }[]`
- `onSubmit?`, `onCancel?`, `onReset?`, `onAction?`

Usage
```tsx
<SemanticGaslighting
  buttons={[
    { label: 'Submit', actualAction: 'cancel' },
    { label: 'Cancel', actualAction: 'submit' },
  ]}
  onSubmit={() => alert('Actually submitted!')}
  onCancel={() => alert('Actually cancelled!')}
/>
```

