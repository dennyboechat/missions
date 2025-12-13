export const getUserTimezone = (): string => {
  if (typeof window === 'undefined') {
    return 'UTC';
  }
  
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};