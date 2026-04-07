# React Pattern

Default frontend pattern for this repo:
- React 19 function components
- TypeScript for component props and state
- Vite entry/build conventions
- Local component state first, shared state only when a real coordination need exists

## Use when

- Adding or extending UI in `src/`
- Building small to medium interactive components
- Wiring browser events, timers, or async UI flows

## Do not use when

- A feature needs cross-route or app-wide state that cannot stay local
- A change is purely styling with no component logic
- Server or API concerns would be clearer as separate modules outside the component

## Default shape

1. Keep each component focused on one UI responsibility.
2. Define a typed props object when the component accepts inputs.
3. Keep derived values in local variables instead of duplicating them in state.
4. Use effects only to synchronize with something external:
   - network requests
   - browser APIs
   - timers
   - subscriptions or event listeners
5. Clean up every effect that registers external work.
6. Keep render logic free of side effects.

## State guidance

- Prefer `useState` for local interactive state.
- Lift state only when two or more siblings genuinely need the same source of truth.
- Do not mirror props into state unless the component intentionally creates editable local draft state.
- Avoid adding shared abstractions for state until there is a concrete duplication or coordination problem.

## Effects and async flows

- Fetch or async work must not start during render.
- Guard against stale async results when a newer request can replace an older one.
- Clear timers and remove listeners in cleanup.
- Prefer explicit event-driven updates over timing-based workarounds.

## UI states

For any non-trivial async UI, account for:
- loading
- empty
- success
- error

Do not leave the component in a silent failure state.

## File and module guidance

- Keep component-specific styles and assets close to the component when practical.
- Move reusable non-UI logic into plain TypeScript modules before introducing new React abstractions.
- Prefer small helper functions over custom hooks until hook reuse is real and repeated.

## Review checklist

- Effects have correct dependencies and cleanup.
- No duplicated derived state.
- No heavy work or side effects during render.
- Async flows handle loading and failure visibly.
- Accessibility is preserved for interactive elements.

## Example

```tsx
type CounterProps = {
  initialCount?: number
}

export function Counter({ initialCount = 0 }: CounterProps) {
  const [count, setCount] = useState(initialCount)
  const label = count === 1 ? 'click' : 'clicks'

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {count} {label}
    </button>
  )
}
```

Why this is the default pattern:
- state is local
- derived UI text stays derived, not stored
- render is pure
- no abstraction is introduced without need