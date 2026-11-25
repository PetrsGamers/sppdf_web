import { describe, expect, it } from 'vitest'

import { formatDuration } from '@/jobs/syncGoogleCalendar'

describe('formatDuration', () => {
  it('shows a one-day all-day event as "Celý den", not 24 hours', () => {
    expect(formatDuration(new Date('2026-12-01'), new Date('2026-12-02'), true)).toBe('Celý den')
  })

  it('counts multi-day all-day events in days with Czech plurals', () => {
    expect(formatDuration(new Date('2026-12-01'), new Date('2026-12-04'), true)).toBe('3 dny')
    expect(formatDuration(new Date('2026-12-01'), new Date('2026-12-08'), true)).toBe('7 dnů')
  })

  it('keeps hours and minutes for timed events', () => {
    const start = new Date('2026-12-01T14:00:00+01:00')
    expect(formatDuration(start, new Date('2026-12-01T15:00:00+01:00'), false)).toBe('1 hodina')
    expect(formatDuration(start, new Date('2026-12-01T17:00:00+01:00'), false)).toBe('3 hodiny')
    expect(formatDuration(start, new Date('2026-12-01T16:30:00+01:00'), false)).toBe('2 h 30 min')
    expect(formatDuration(start, new Date('2026-12-01T14:45:00+01:00'), false)).toBe('45 min')
  })
})
