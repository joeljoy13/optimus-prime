
On each transformation:

1. Compute a SHA-256 hash of the current state plus transformation type:
   `new_index_hash = SHA256(current_prime || transformation)`

2. Convert hash into a BigInt:
   `hash_bigint = BigInt(new_index_hash)`

3. Bound the index:
   `bounded_index = hash_bigint mod M`  
   *M defaults to 10,000*

4. Find the `(bounded_index + 1)`-th prime of the selected type

5. Set:
   `STATE = resulting_prime`

All steps use `BigInt` and secure primitives.

---

## 🛡 Security Notes

- Initial state seeding uses secure entropy (`crypto.randomBytes()`), not `Math.random()`.
- Transformation indexing is deterministic and reproducible.
- Prime generation uses Miller–Rabin with robust small-prime screening.
- Electron context isolation enabled via preload + IPC bridge.

---

## 📸 Screenshots

_Add screenshots here when ready:_

- `docs/screenshots/main-dashboard.png`
- `docs/screenshots/transform-history.png`
- `docs/screenshots/export-panel.png`

---

## 💿 Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/joeljoy13/optimus-prime.git
cd optimus-prime
npm install