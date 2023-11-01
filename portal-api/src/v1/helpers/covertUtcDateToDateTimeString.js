/**
 * Coverts timestamp as a string to format for email '20 October 2023 at 11:10 am'
 * @param {string} dateTimeUtc - UTC date time string
 * @returns {string} - date time string for email eg. '20 October 2023 at 11:10 am'
 */
const formatDateTimeForEmail = (dateTimeUtc) => {
  const submittedDate = new Date(dateTimeUtc);
  const formattedDate = submittedDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = submittedDate.toLocaleTimeString('en-GB', { hourCycle: 'h12', hour: 'numeric', minute: 'numeric' });
  return `${formattedDate} at ${formattedTime}`;
};

module.exports = {
  formatDateTimeForEmail,
};
