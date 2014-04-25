# 0.5.1

- fix(global): Revert global name back to `sinonDoublist`

# 0.5.0

- fix(timers): Omit fake timers from auto-sandbox
- chore(npm): Upgrade outdated dependencies

# 0.4.3

- chore(npm): Upgrade outdated dependencies

# 0.4.2

- feat(mixin): Add `stubBind`, a convenience wrapper around `stubWithReturn` to target a function's `bind` method.
- Upgrade `sinon` peer dependency to `~1.7.3`.

# 0.4.1

- chore(npm): Upgrade outdated dev dependencies

# 0.4.0

- Upgrade `sinon` peer dependency to `~1.7.2`.
- Upgrade jQuery fixture to `2.0.0`.

# 0.3.3

- Upgrade `apidox`.

# 0.3.2

- Remove NPM shrinkwrapping.

# 0.3.1

- Remove `karma` as optional dependency.

# 0.3.0

- Fix NPM compatibility.

# 0.2.3

- Add missing `stubWithReturn` support for array of spy paths in `x.y.z` format.

# 0.2.2

- `stubWithReturn` now creates `method` if it does not exist in the target object.
- Migrate from `logicalparadox/goodwin` component to updated/renamed `qualiancy/tea-properties`.

# 0.2.1

- Fix: `requests` now correctly points to `server.requests`.

# 0.2.0

- Add: Global injection of mixin methods for mocha via `sinonDoublist(sinon, 'mocha')`.

# 0.1.2

- Fix: Test context could not re-create sandboxes after restoring them. Prevented fake timers from working in `beforeEach/afterEach`-style cycles.

# 0.1.1

- Fix: Mixing in of `clock`, `server`, `requests`

# 0.1.0

- Added: `spyMany`, `stubMany`, `stubWithReturn`, `restoreSandbox`
