# PRIME ORBIT

PRIME ORBIT is an Electron desktop application that transforms a prime-number state through deterministic cryptographic indexing to generate reproducible, high-entropy password outputs.

## Features

- Deterministic prime transformation engine (`SHA-256` + bounded index).
- Prime families: Regular, Twin, Sophie Germain, Safe, Prime Gap, Hash & Re-Prime.
- BigInt-based arithmetic with Miller-Rabin primality checks.
- Manual prime state input with strict validation.
- Random prime generation (`64/128/256/512` bit) from `crypto.randomBytes()`.
- Configurable modulo bound `M` (`100..100000`) with safe fallback on invalid input.
- Export encodings: Base62, Base85, Hex, ASCII printable.
- Entropy indicator, copy-to-clipboard, reset, and session save.
- Interactive tutorial mode with guided highlights.
- Optional synthesized Matrix-inspired sound design (Web Audio API).
- Windows NSIS executable packaging via `electron-builder`.

## Mathematical Model

State:

`STATE = current_prime`

For a selected transformation `T`:

1. `new_index_hash = SHA256(current_prime || T)`
2. `hash_bigint = BigInt(new_index_hash)`
3. `bounded_index = hash_bigint mod M`
4. Select the `(bounded_index + 1)`th prime of the chosen family
5. Set `STATE = resulting_prime`

For fixed `(STATE, T, M)`, the next state is deterministic.

## Manual Prime Input

`Set Prime State` accepts a user-defined integer and validates:

- positive integer
- `>= 2`
- Miller-Rabin prime check

Invalid input is rejected inline and state remains unchanged.

## Random Prime Generator

Use `Generate Random Prime` to securely replace state with a fresh random prime.

- RNG source: `crypto.randomBytes()`
- Bit length options:
  - `64-bit`
  - `128-bit` (default)
  - `256-bit`
  - `512-bit` (performance warning shown)
- Candidate handling:
  - proper bit masking
  - highest bit forced for requested width
  - odd candidate enforced
  - Miller-Rabin loop until prime found

When generated, history is reset with event: `Random Prime Generated`.

## Custom Index Bound (M)

`Index Bound (M)` controls transform index capping.

- Default: `10000`
- Min: `100`
- Max: `100000`
- Integer-only input

Invalid values:

- show inline validation error
- revert to previous valid value

Higher `M` broadens search index space and can increase compute time.

## Tutorial Mode

Click `Tutorial Mode` for a built-in guided walkthrough.

Steps cover:

1. Current Prime State
2. Prime Families
3. Transformation feedback
4. Modulo bound (`M`)
5. Export encoding
6. Entropy indicator

Behavior:

- glass overlay with dimmed background
- one-at-a-time UI highlighting
- Next / Back / Exit controls
- completion flag saved in local storage to avoid auto-open after completion

## Sound Design

No external copyrighted assets are used.

Audio is synthesized in real time using the Web Audio API:

- short digital glitch tone on transformation
- short whoosh on prime state change
- optional low ambient hum
- settings toggles for sound and hum

Design target is subtle and minimal (< 300 ms event tones).

## Security Notes

- No `Math.random()` for cryptographic state.
- Secure entropy from `crypto.randomBytes()`.
- Prime validation through Miller-Rabin with small-prime filtering.
- No `eval` or unsafe dynamic parsing for numeric input.
- Electron renderer/main split via preload IPC bridge and context isolation.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Creating the Executable

One-command workflow:

```bash
npm run make-exe
```

This runs install, build, and Windows packaging.

Primary scripts:

- `npm run build`
- `npm run dist`
- `npm run make-exe`

Generated installer location:

- `release/Prime-Orbit-<version>-Setup.exe`

## For Non-Developers

1. Open the GitHub Releases page for PRIME ORBIT.
2. Download the latest `Prime-Orbit-...-Setup.exe`.
3. Double-click the installer and follow prompts.

No Node.js installation is required for end users.

## Tests

```bash
npm test
```

Includes tests for:

- Miller-Rabin
- Prime family generation
- Hash-based bounded indexing
- Encoding functions
- Manual input validation
- Modulo validation and integration
- Random prime bit-length correctness
- Tutorial preference state
- Sound toggle state

## Screenshots

Add screenshots here:

- `docs/screenshots/main-dashboard.png`
- `docs/screenshots/transform-history.png`
- `docs/screenshots/tutorial-mode.png`

## License

MIT. See `LICENSE`.
