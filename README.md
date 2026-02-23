# PRIME ORBIT

PRIME ORBIT is a desktop cryptographic utility that evolves a prime-number state through deterministic, hash-indexed transformations to produce reproducible high-entropy password outputs.

## Features

- Deterministic prime transformation engine with SHA-256 bounded indexing.
- Prime families: Regular, Twin, Sophie Germain, Safe, Prime Gap, Hash & Re-Prime.
- BigInt-only arithmetic and Miller-Rabin primality testing.
- Cryptographically secure initial seed from `crypto.randomBytes()`.
- Export encodings: Base62, Base85, Hex, ASCII printable.
- Manual Prime Input with strict primality validation.
- Custom Index Bound (`M`) with validation and safe fallback behavior.
- Session save, reset, copy-to-clipboard, and entropy estimation.
- Electron desktop delivery with React + TypeScript + Tailwind glassmorphism UI.

## Mathematical Model

State:

`STATE = current_prime`

For a selected transformation `T`:

1. `new_index_hash = SHA256(current_prime || T)`
2. `hash_bigint = BigInt(new_index_hash)`
3. `bounded_index = hash_bigint mod M`
4. Select the `(bounded_index + 1)`th prime of the chosen type
5. `STATE = resulting_prime`

All operations are deterministic for the same `(STATE, T, M)` triple.

## Manual Prime Input

Users may set their own starting prime from the UI (`Set Prime State`).

Validation rules:

- Must be a positive integer.
- Must be at least `2`.
- Must pass Miller-Rabin primality testing.

If invalid, state is not updated and an inline error is shown. Composite inputs return: `Input is not prime.`

If valid:

- Current state is replaced.
- Transformation history is cleared and a `Manual Prime Set` event is logged.

## Custom Index Bound (M)

Users can adjust `M` (`Index Bound (M)`) that controls hash-indexed prime selection.

- Default: `10,000`
- Minimum: `100`
- Maximum: `100,000`
- Integer-only validation

Invalid `M` behavior:

- Inline validation error is shown.
- Input reverts to the previous valid value.

Performance note:

- Large `M` values trigger a non-blocking warning because they may increase transform time.

### Effect of Custom M

- Computational complexity:
  - Higher `M` can map to larger ordinal indices, requiring deeper prime-family search.
- Growth control:
  - Smaller `M` constrains reachable index space, keeping transitions tighter.
- Determinism:
  - For fixed `(current_prime, transformation, M)`, resulting index and state remain reproducible.

## Security Notes

- No `Math.random()` is used for cryptographic state setup.
- Initial prime state is derived from secure entropy via `crypto.randomBytes()`.
- Primality checks use Miller-Rabin with pre-screening against small primes.
- Renderer/main boundary uses Electron preload + IPC with context isolation.
- No `eval` or unsafe parsing is used for numeric input handling.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Building Executable

```bash
npm run build
npm run dist
```

- `npm run dist` builds a Windows NSIS installer (`.exe`).
- Cross-platform packaging config is included for macOS (`dmg`) and Linux (`AppImage`, `deb`).

## Publishing to GitHub

1. Initialize and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial release: PRIME ORBIT"
   ```
2. Create a GitHub repository and add remote:
   ```bash
   git remote add origin <your-repository-url>
   git branch -M main
   git push -u origin main
   ```
3. Attach installer files from `release/` to a GitHub Release (optional).

## Tests

```bash
npm test
```

Includes coverage for:

- Miller-Rabin primality behavior
- Prime family generation
- Hash-based bounded indexing
- Encoding outputs
- Prime input validation
- Modulo validation
- Custom `M` transform behavior, including edge bounds (`100`, `100000`)

## Screenshots

Add images here after running the app:

- `docs/screenshots/main-dashboard.png`
- `docs/screenshots/transform-history.png`
- `docs/screenshots/export-panel.png`

## License

MIT. See `LICENSE`.
