// Provide a minimal requestAnimationFrame implementation for tests that rely on it.
(global as any).requestAnimationFrame = (cb: (timestamp: number) => void): number => {
  const handle = setTimeout(() => cb(Date.now()), 0);
  return handle as unknown as number;
};

// Polyfill cancelAnimationFrame to avoid runtime errors in loops.
(global as any).cancelAnimationFrame = (handle: number) => {
  clearTimeout(handle as unknown as NodeJS.Timeout);
};
