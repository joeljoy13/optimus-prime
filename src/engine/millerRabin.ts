const SMALL_PRIMES: bigint[] = [
  2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n
];

const modPow = (base: bigint, exponent: bigint, modulus: bigint): bigint => {
  if (modulus === 1n) {
    return 0n;
  }

  let result = 1n;
  let b = base % modulus;
  let e = exponent;

  while (e > 0n) {
    if ((e & 1n) === 1n) {
      result = (result * b) % modulus;
    }
    e >>= 1n;
    b = (b * b) % modulus;
  }

  return result;
};

export const isProbablyPrime = (n: bigint): boolean => {
  if (n < 2n) {
    return false;
  }

  for (const prime of SMALL_PRIMES) {
    if (n === prime) {
      return true;
    }
    if (n % prime === 0n) {
      return false;
    }
  }

  if (n % 2n === 0n) {
    return false;
  }

  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1n;
  }

  for (const witness of SMALL_PRIMES) {
    if (witness >= n - 1n) {
      continue;
    }

    let x = modPow(witness, d, n);
    if (x === 1n || x === n - 1n) {
      continue;
    }

    let isComposite = true;
    for (let r = 1n; r < s; r += 1n) {
      x = (x * x) % n;
      if (x === n - 1n) {
        isComposite = false;
        break;
      }
    }

    if (isComposite) {
      return false;
    }
  }

  return true;
};

export const nextPrime = (value: bigint): bigint => {
  if (value <= 2n) {
    return 2n;
  }

  let candidate = value % 2n === 0n ? value + 1n : value;
  while (!isProbablyPrime(candidate)) {
    candidate += 2n;
  }
  return candidate;
};
