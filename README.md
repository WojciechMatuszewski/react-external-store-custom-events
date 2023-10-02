# `useSyncExternalStore` + custom `EventTarget`

- The `useSyncExternalStore` triggers the UI updates.

- The `EventTarget` is for holding state and subscribers.

  - It is nice that we do not have to manage the subscribers ourselves. The `EventTarget` API does that for us.
