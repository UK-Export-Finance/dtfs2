/**
 * Coverts date to format for email '20 October 2023 at 11:10 am'
 * @param date
 * @returns date time string for email eg. '20 October 2023 at 11:10 am'
 */
export const formatDateForEmail = (date: Date): string => {
  const formattedDate = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-GB', { hourCycle: 'h12', hour: 'numeric', minute: 'numeric' });
  return `${formattedDate} at ${formattedTime}`;
};
