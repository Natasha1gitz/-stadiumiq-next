/** Tests for Edge Middleware — 8 test cases as per test-plan.md Module 8. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { proxy } from '../proxy';
import { NextRequest } from 'next/server';

describe('Edge Middleware', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createRequest = (ip: string) => {
    return new NextRequest('https://test.com', {
      headers: new Headers({ 'x-forwarded-for': ip }),
    });
  };

  // Test 1: Response includes CSP header
  it('includes Content-Security-Policy header', () => {
    const response = proxy(createRequest('1.1.1.1'));
    const csp = response.headers.get('Content-Security-Policy');

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
  });

  // Test 2: Response includes HSTS header
  it('includes Strict-Transport-Security header', () => {
    const response = proxy(createRequest('1.1.1.2'));
    const hsts = response.headers.get('Strict-Transport-Security');

    expect(hsts).toContain('max-age=63072000');
  });

  // Test 3: Response includes X-Frame-Options: DENY
  it('includes X-Frame-Options: DENY', () => {
    const response = proxy(createRequest('1.1.1.3'));
    
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });

  // Test 4: Response includes X-Content-Type-Options: nosniff
  it('includes X-Content-Type-Options: nosniff', () => {
    const response = proxy(createRequest('1.1.1.4'));
    
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  // Test 5: Response includes Referrer-Policy
  it('includes Referrer-Policy header', () => {
    const response = proxy(createRequest('1.1.1.5'));
    
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  // Test 6: Response includes Permissions-Policy
  it('includes Permissions-Policy header', () => {
    const response = proxy(createRequest('1.1.1.6'));
    
    expect(response.headers.get('Permissions-Policy')).toContain('camera=()');
  });

  // Test 7: Rate limiter blocks after max requests/minute
  it('blocks requests after max requests per minute', () => {
    const ip = '1.2.3.4';
    const rateLimit = process.env.NODE_ENV === 'development' || process.env['CI'] ? 1000 : 100;
    
    for (let i = 0; i < rateLimit; i++) {
      const res = proxy(createRequest(ip));
      expect(res.status).not.toBe(429);
    }

    const blockedRes = proxy(createRequest(ip));
    expect(blockedRes.status).toBe(429);
  });

  // Test 8: Rate limiter resets after window expires
  it('allows requests after rate limit window expires', () => {
    const ip = '5.6.7.8';
    const rateLimit = process.env.NODE_ENV === 'development' || process.env['CI'] ? 1000 : 100;
    
    for (let i = 0; i < rateLimit + 1; i++) {
      proxy(createRequest(ip));
    }

    expect(proxy(createRequest(ip)).status).toBe(429);

    // Advance time past 60 seconds
    vi.advanceTimersByTime(61_000);

    const allowedRes = proxy(createRequest(ip));
    expect(allowedRes.status).not.toBe(429);
  });

  // Test 9: Falls back to 127.0.0.1 when x-forwarded-for is missing
  it('falls back to 127.0.0.1 when x-forwarded-for is missing', () => {
    const req = new NextRequest('https://test.com');
    const response = proxy(req);
    expect(response.status).toBe(200);
  });
});
