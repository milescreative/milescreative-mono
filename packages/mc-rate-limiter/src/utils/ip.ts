interface GenHeaders {
  [key: string]: string | string[] | undefined;
}

// Pre-compile regex for performance
const FORWARDED_REGEX = /(?:^|[;,]\s*)for=([^;,\s]+)/;
const CLEANUP_REGEX = /["[\]]/g;

/**
 * Extract first IP from a comma-separated list
 * Optimized for minimal string operations
 */
function extractFirstIp(value: string | string[]): string | undefined {
  if (!value) return undefined;

  // Fast path for single string without commas
  if (typeof value === 'string') {
    const commaIndex = value.indexOf(',');
    return commaIndex === -1 ? value.trim() : value.slice(0, commaIndex).trim();
  }

  // Array path
  const first = value[0];
  if (!first) return undefined;

  const commaIndex = first.indexOf(',');
  return commaIndex === -1 ? first.trim() : first.slice(0, commaIndex).trim();
}

/**
 * Parse RFC 7239 Forwarded header
 * Optimized version that minimizes regex usage
 */
function parseForwardedHeader(value: string): string | undefined {
  const match = FORWARDED_REGEX.exec(value);
  if (match?.[1]) {
    // Only clean if necessary
    return match[1].includes('"') || match[1].includes('[')
      ? match[1].replace(CLEANUP_REGEX, '').trim()
      : match[1].trim();
  }
  return undefined;
}

/**
 * Get the client IP address from various possible headers and sources
 * @param headers Object containing request headers
 * @param remoteAddress Optional fallback IP address
 * @returns The client IP address or undefined if not found
 */
export function getClientIp(headers: GenHeaders | Headers, remoteAddress?: string): string | undefined {
  // Helper function to get header value accounting for both types
  const getHeader = (name: string): string | string[] | undefined => {
    if (headers instanceof Headers) {
      const value = headers.get(name);
      return value ?? undefined;
    }
    return (headers as GenHeaders)[name];
  };

  // Fast path: Check most common headers first
  const xForwardedFor = getHeader('x-forwarded-for') ?? getHeader('X-Forwarded-For');
  if (xForwardedFor) {
    const ip = extractFirstIp(xForwardedFor);
    if (ip) return ip;
  }

  // Check all possible headers without case normalization
  const headersToCheck: Array<readonly [string, string]> = [
    // Most common CDN/proxy headers
    ['cf-connecting-ip', 'CF-Connecting-IP'],        // Cloudflare
    ['x-client-ip', 'X-Client-IP'],                 // General
    ['x-real-ip', 'X-Real-IP'],                     // Nginx
    ['x-forwarded', 'X-Forwarded'],                 // General
    ['forwarded-for', 'Forwarded-For'],             // General
    ['x-forwarded-for', 'X-Forwarded-For'],         // General
    ['true-client-ip', 'True-Client-IP'],           // Akamai/Cloudflare
    ['x-cluster-client-ip', 'X-Cluster-Client-IP'], // Rackspace/Riverbed
    ['fastly-client-ip', 'Fastly-Client-IP'],       // Fastly CDN
    ['x-forwarded-host', 'X-Forwarded-Host'],       // General
    ['x-original-forwarded-for', 'X-Original-Forwarded-For'], // AWS
    ['x-coming-from', 'X-Coming-From'],             // General
    ['via', 'Via'],                                 // Standard
    ['x-real-forwarded-for', 'X-Real-Forwarded-For'] // General
  ] as const;

  for (const [lower, upper] of headersToCheck) {
    const value = getHeader(lower) ?? getHeader(upper);
    if (value) {
      const ip = extractFirstIp(value);
      if (ip) return ip;
    }
  }

  // Last check: Forwarded header (RFC 7239)
  const forwarded = getHeader('forwarded') ?? getHeader('Forwarded');
  if (forwarded) {
    const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (value) {
      const ip = parseForwardedHeader(value);
      if (ip) return ip;
    }
  }

  return remoteAddress;
}
