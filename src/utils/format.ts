export const formatPrimeLabel = (prime: string): string => {
  if (prime.length <= 28) {
    return prime;
  }
  return `${prime.slice(0, 18)}...${prime.slice(-10)}`;
};

export const formatTimestamp = (isoTime: string): string =>
  new Date(isoTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const transformTitles: Record<string, string> = {
  regular: 'Regular Prime',
  twin: 'Twin Prime',
  'sophie-germain': 'Sophie Germain',
  safe: 'Safe Prime',
  'prime-gap': 'Prime Gap',
  'hash-reprime': 'Hash & Re-Prime',
  'manual-set': 'Manual Prime Set',
  'random-generated': 'Random Prime Generated'
};
