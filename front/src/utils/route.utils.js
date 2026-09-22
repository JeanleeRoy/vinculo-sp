/**
 * UUID regex matcher (matches UUIDv1-v7 or 32-36 char alphanumeric-dashed identifiers)
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Extracts message ID from URL path specifically matching /m/:messageId or query (?id= / ?m=)
 */
export function extractMessageIdFromUrl() {
  const url = new URL(window.location.href);

  // 1. Check path specifically for /m/:messageId
  const match = url.pathname.match(/\/m\/([^\/\?#]+)/);
  if (match && match[1]) {
    const rawId = match[1].trim();
    if (isValidIdentifier(rawId)) {
      return rawId;
    }
  }

  // 2. Check query parameters fallback (?id= or ?m=)
  const queryId = url.searchParams.get('id') || url.searchParams.get('m');
  if (queryId && isValidIdentifier(queryId.trim())) {
    return queryId.trim();
  }

  // 3. Check clean root path segment /:id as second fallback
  const segments = url.pathname
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    if (segment.includes('.') || segment === 'm' || segment === 'messages') {
      continue;
    }
    if (isValidIdentifier(segment)) {
      return segment;
    }
  }

  return null;
}

export function isValidIdentifier(value) {
  if (typeof value !== 'string') return false;
  return UUID_REGEX.test(value);
}
