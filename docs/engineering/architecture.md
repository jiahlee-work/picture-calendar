# Architecture

This repository follows a React/TypeScript product layering model.

## Source Shape

```text
src/
  presentation/
  application/
  infrastructure/
  shared/
  types/
```

## Boundaries

- `src/presentation` owns visible UI, page or screen composition, forms, tables,
  dialogs, and interaction wiring.
- `src/application` owns user intent, product flow, state orchestration, cache
  policy, and use cases.
- `src/infrastructure` owns concrete external integrations, clients, transport
  DTOs, response mapping, browser APIs, and storage.
- `src/shared` owns stable neutral code that can be reused across boundaries.
  Cross-layer data contracts may live here when both application and
  infrastructure need them, but product policy, defaults, catalogs, and feature
  orchestration must not.
- `src/types` owns ambient declarations and module augmentation.

## Rules

- Keep framework entry points thin.
- Keep dependency direction one-way:
  presentation -> application -> infrastructure -> external systems.
- Application code may coordinate infrastructure and shared code, but should not
  render UI.
- Infrastructure code must not depend on presentation or application.
- `shared` must stay neutral. It must not depend on presentation, application,
  or infrastructure.
- Keep feature-specific code near the feature that owns it instead of forcing it
  into `shared`.
- Read environment variables only under `src/env`.
- Use the configured `@/` alias for imports between files under `src/`. Do not
  use `./` or `../` for local imports inside `src`, including imports within
  the same feature folder.

## Presentation Structure

- `src/presentation/components` owns reusable UI that can be used by multiple
  product features.
- `src/presentation/features/<feature>` owns screens and UI used only by that
  feature.
- Reusable components must not import feature components. Move both components
  into the owning feature or promote both to reusable components.
- Keep router access and application-hook wiring in feature screens or
  presentation providers. Reusable components receive values and callbacks.

### Atomic Components

- `atoms` are basic controls or visual primitives. They do not compose other
  product UI components.
- `molecules` combine atoms into a small reusable control or content unit.
- `organisms` combine atoms and molecules into an independent section, overlay,
  navigation element, or domain-aware composite.
- `templates` own page-scale visual layout. They do not fetch data, access the
  router, or own product flows.
- Classify by responsibility and composition, not by line count.
- Extract a nested component when it has a distinct responsibility, meaningful
  reuse, or an independently documented state. Keep transparent one-use
  wrappers inline.
