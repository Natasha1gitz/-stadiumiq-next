/** RFC 9116 security.txt route handler for coordinated vulnerability disclosure. */

/**
 * Returns an RFC 9116 compliant security.txt response.
 *
 * @returns A plain-text Response containing contact, disclosure policy, and expiry.
 *
 * @example
 * ```
 * GET /.well-known/security.txt → 200 text/plain
 * ```
 */
export function GET(): Response {
  const body = [
    'Contact: mailto:security@stadiumiq-next.dev',
    'Expires: 2027-12-31T23:59:00.000Z',
    'Preferred-Languages: en',
    'Canonical: https://stadiumiq-next.dev/.well-known/security.txt',
    'Policy: https://stadiumiq-next.dev/security-policy',
  ].join('\n');

  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
