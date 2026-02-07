/**
 * Utility to extract secret parameters from URL query string.
 * Used for admin initialization during first-time setup.
 */
export function getSecretParameter(paramName: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}
