/** Tests for DataMasker — 7 test cases as per test-plan.md Module 6. */
import { describe, it, expect, vi } from 'vitest';
import { maskPII, log } from '@/lib/infrastructure/logger';

describe('maskPII', () => {
  // Test 1: Masks email addresses
  it('masks email addresses', () => {
    const result = maskPII('Contact test@example.com for info');

    expect(result).toContain('t***@e***.com');
    expect(result).not.toContain('test@example.com');
  });

  // Test 2: Masks steward IDs
  it('masks steward IDs (STW-XXXX pattern)', () => {
    const result = maskPII('Assign STW-1234 to gate A');

    expect(result).toContain('STW-****');
    expect(result).not.toContain('STW-1234');
  });

  // Test 3: Masks GPS coordinates
  it('masks GPS coordinates', () => {
    const result = maskPII('Location: 40.7128, -74.0060');

    expect(result).toContain('[REDACTED]');
    expect(result).not.toContain('40.7128');
  });

  // Test 4: Preserves non-PII text
  it('preserves non-PII text unchanged', () => {
    const input = 'Gate A12 is busy.';

    expect(maskPII(input)).toBe(input);
  });

  // Test 5: Handles multiple PII instances
  it('masks multiple PII instances in same string', () => {
    const input = 'User a@b.com and c@d.com at STW-5678';
    const result = maskPII(input);

    expect(result).not.toContain('a@b.com');
    expect(result).not.toContain('c@d.com');
    expect(result).not.toContain('STW-5678');
  });

  // Test 6: Handles empty string
  it('returns empty string for empty input', () => {
    expect(maskPII('')).toBe('');
  });
});

describe('log', () => {
  // Test 7: Logger calls DataMasker before output
  it('calls maskPII before writing to console', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    log('info', 'User test@email.com logged in');

    expect(spy).toHaveBeenCalledTimes(1);
    const output = spy.mock.calls[0]?.[0] as string;

    expect(output).not.toContain('test@email.com');
    expect(output).toContain('t***@e***.com');

    spy.mockRestore();
  });

  it('uses console.error for error level', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    log('error', 'Something failed');

    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockRestore();
  });
});
