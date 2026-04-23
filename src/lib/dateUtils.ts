/**
 * Returns the current date in YYYY-MM-DD format based on local timezone.
 * This avoids the common issue where toISOString() returns yesterday's date
 * if called early in the morning in some timezones.
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
  return adjustedDate.toISOString().split("T")[0];
};

/**
 * Formats a given date to YYYY-MM-DD local string.
 */
export const formatLocalDate = (date: Date): string => {
  return getLocalDateString(date);
};
