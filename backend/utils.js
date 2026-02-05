function calculateDaysLeft(startDate, durationMonths) {
  const TOTAL_DAYS = Number(durationMonths) * 30;
  const now = Date.now();
  const daysElapsed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  return TOTAL_DAYS - daysElapsed;
}

module.exports = { calculateDaysLeft };
