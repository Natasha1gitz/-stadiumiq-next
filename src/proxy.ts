/** Edge Middleware — Security headers and sliding-window rate limiting. */
import { type NextRequest, NextResponse } from 'next/server';

/** Maximum requests allowed per IP within the sliding window. */
/* v8 ignore next */
const RATE_LIMIT_MAX = process.env.NODE_ENV === 'development' || process.env['CI'] ? 1000 : 100;

/** Sliding window duration in milliseconds (60 seconds). */
const RATE_LIMIT_WINDOW_MS = 60_000;

/**
 * In-memory sliding-window rate limiter store.
 * Maps IP addresses to arrays of request timestamps.
 */
const rateLimitStore = new Map<string, number[]>();

/**
 * Content Security Policy header value.
 * Blocks all external scripts and frames for maximum XSS protection.
 */
const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://generativelanguage.googleapis.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/**
 * Checks whether a given IP has exceeded the rate limit.
 *
 * @param ip - The client IP address.
 * @returns `true` if the request should be blocked.
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = rateLimitStore.get(ip) ?? [];
  const recent = timestamps.filter((t) => t > windowStart);

  recent.push(now);
  rateLimitStore.set(ip, recent);

  return recent.length > RATE_LIMIT_MAX;
}

/**
 * Applies strict security headers to a NextResponse.
 *
 * @param response - The response to augment with security headers.
 * @returns The same response with headers appended.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', CSP_HEADER);
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  return response;
}

/**
 * Next.js Edge Middleware entry point.
 * Enforces rate limiting and injects security headers on every request.
 *
 * @param request - The incoming request.
 * @returns A NextResponse with security headers or a 429 rate-limit response.
 */
export function proxy(request: NextRequest): NextResponse {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  // Whitelist localhost for E2E testing
  if (ip !== '127.0.0.1' && ip !== '::1' && isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const response = NextResponse.next();

  return applySecurityHeaders(response);
}

/**
 * Middleware matcher — applies to all routes except static assets.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
