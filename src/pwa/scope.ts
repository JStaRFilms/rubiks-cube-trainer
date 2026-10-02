// Published paths are literal absolute paths, not URL references or encoded paths.
export function isScopedPath(path: string, base: string): boolean {
  return path.startsWith(base) && !/[\\%?#\s]/.test(path) && [...path].every((char) => char.charCodeAt(0) > 32 && char.charCodeAt(0) !== 127)
    && !path.slice(1).split('/').some((part, index, parts) => part === '.' || part === '..' || (part === '' && index !== parts.length - 1));
}
export function normalizeBasePath(value: string): string {
  const base = value.endsWith('/') ? value : `${value}/`;
  if (!base.startsWith('/') || !isScopedPath(base, '/') || !/^\/[A-Za-z0-9_/-]*$/.test(base)) throw new Error('VITE_BASE_PATH must be a literal root or repository path.');
  return base;
}
export function isScopedUrl(url: URL, scope: URL): boolean {
  return url.origin === scope.origin && isScopedPath(url.pathname, scope.pathname);
}
export function releaseCacheName(base: string, releaseId: string): string {
  return `cube-trainer-assets-${encodeURIComponent(base)}-${releaseId}`;
}
