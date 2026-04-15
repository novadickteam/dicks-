import { formatDate, sleep } from '../src/utils/helpers';

describe('helpers', () => {
  test('formatDate devuelve formato YYYY-MM-DD', () => {
    const date = new Date('2025-01-15T10:00:00Z');
    expect(formatDate(date)).toBe('2025-01-15');
  });

  test('sleep espera el tiempo indicado', async () => {
    const start = Date.now();
    await sleep(100);
    expect(Date.now() - start).toBeGreaterThanOrEqual(90);
  });
});
