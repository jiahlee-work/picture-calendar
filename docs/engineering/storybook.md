# Storybook

Storybook rules define when and where agents should add stories. They do not
choose a Storybook framework package, builder, addon set, or package script.

## Principles

- Add or update stories for reusable UI components and important UI states when
  a change affects presentation behavior.
- Prefer stories that show meaningful states: default, loading, empty, error,
  disabled, focused, and populated.
- Use realistic props and accessible labels.
- Do not create broad example stories unrelated to changed or reusable
  components.
- Do not introduce Storybook tooling unless the user explicitly asks.

## File Placement

For reusable components under `src/presentation/components`, place stories in a
`__stories__` directory under the matching atomic level:

```text
src/presentation/components/atoms/button.tsx
src/presentation/components/atoms/__stories__/button.stories.tsx

src/presentation/components/molecules/date-picker.tsx
src/presentation/components/molecules/__stories__/date-picker.stories.tsx
```

For feature-local stories, place stories next to the feature component they
document:

```text
src/presentation/features/login/login-form.tsx
src/presentation/features/login/login-form.stories.tsx
```

Place reusable Storybook-only fixture data under
`src/presentation/storybook/fixtures`.

Use `*.stories.tsx` for React component stories.
