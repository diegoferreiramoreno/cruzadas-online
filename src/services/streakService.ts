/**
 * Deterministic streak calculation service according to data-model.md section 2.
 */
export function calculateStreaks(
  completedCycleIds: string[],
  todayCycleId: string
): { currentStreak: number; maxStreak: number } {
  // Sort unique dates in YYYY-MM-DD format
  const sortedDates = Array.from(new Set(completedCycleIds)).sort();

  // 1. Calculate maxStreak historically (longest consecutive run in sortedDates)
  let maxStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const currDate = new Date(dateStr + 'T12:00:00Z');
    if (!prevDate) {
      running = 1;
    } else {
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
      if (diffDays === 1) {
        running += 1;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    prevDate = currDate;
    if (running > maxStreak) {
      maxStreak = running;
    }
  }

  // 2. Calculate currentStreak relative to todayCycleId
  // currentStreak is > 0 only if today or yesterday was completed
  let currentStreak = 0;
  const today = new Date(todayCycleId + 'T12:00:00Z');
  const yesterday = new Date(today.getTime() - 86400000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const completedSet = new Set(sortedDates);

  if (completedSet.has(todayCycleId)) {
    // Active sequence ending today: count backwards
    currentStreak = 1;
    let checkDate = yesterday;
    while (completedSet.has(checkDate.toISOString().slice(0, 10))) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    }
  } else if (completedSet.has(yesterdayStr)) {
    // Played yesterday but not today yet: yesterday's streak remains active
    currentStreak = 1;
    let checkDate = new Date(yesterday.getTime() - 86400000);
    while (completedSet.has(checkDate.toISOString().slice(0, 10))) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    }
  } else {
    // Neither today nor yesterday completed: streak is 0
    currentStreak = 0;
  }

  return {
    currentStreak,
    maxStreak
  };
}
