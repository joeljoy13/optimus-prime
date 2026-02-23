# PRIME ORBIT

PRIME ORBIT is a cinematic desktop cryptography tool where each transformation bends state through prime-space: deterministic transitions, bounded indexing, and secure entropy fused into a password-generation orbit.

## Features

- Deterministic prime transformation engine with bounded SHA-256 indexing.
- Prime families: regular, twin, Sophie Germain, safe, prime-gap, hash & re-prime.
- BigInt-first implementation with Miller-Rabin primality testing.
- Cryptographically secure initial state seeding via `crypto.randomBytes()`.
- Password export formats: `Base62`, `Base85`, `Hex`, `ASCII printable`.
- Entropy indicator, copy-to-clipboard, session save, and full state reset.
- Electron desktop app with React + TypeScript + Tailwind glassmorphism UI.
- Packaging via `electron-builder` with Windows `.exe` target.

## Mathematical Model

State is a single BigInt prime:

`STATE = current_prime`

For selected transformation `T`:

1. `new_index_hash = SHA256(current_prime || T)`
2. `hash_bigint = BigInt(new_index_hash)`
3. `bounded_index = hash_bigint mod M`
4. Find the `(bounded_index + 1)`th prime of the selected type
5. `STATE = resulting_prime`

Where:

- `M` is configurable (default `10,000`)
- All prime arithmetic uses `BigInt`
- Primality checks use a Miller-Rabin implementation

## Security Notes

- Initial state uses secure entropy from `Node.js crypto.randomBytes`.
- No use of `Math.random()` for cryptographic operations.
- Transformation indexing is deterministic and SHA-256 based.
- Prime generation uses probabilistic Miller-Rabin with fixed witness set and small-prime prechecks.
- Context isolation is enabled in Electron via preload/IPC bridge.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

This starts:

- Vite dev server for the React renderer
- TypeScript watch build for Electron main/preload
- Electron app pointed at the Vite dev URL

## Building Executable

Build app artifacts:

```bash
npm run build
```

Build Windows installer (`.exe`):

```bash
npm run dist
```

Build all configured platforms (from appropriate host/CI environments):

```bash
npm run dist:all
```

Notes:

- Windows `.exe` uses NSIS target (configured in `electron-builder.json`).
- macOS build target: `dmg`.
- Linux build targets: `AppImage`, `deb`.

## Publishing to GitHub

1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial release: PRIME ORBIT"
   ```
2. Create a GitHub repository named `prime-orbit`.
3. Push:
   ```bash
   git remote add origin <your-repo-url>
   git branch -M main
   git push -u origin main
   ```
4. (Optional) Attach installer artifacts from `release/` to GitHub Releases.

## Screenshots

_Add screenshots here after running the desktop app._

- `docs/screenshots/main-dashboard.png`
- `docs/screenshots/transform-history.png`
- `docs/screenshots/export-panel.png`

## License

MIT License. See `LICENSE`.
