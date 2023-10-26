/**
 * Coverts timestamp as a string to format for email '20 October 2023 at 11:10 am'
 * @param {string} dateTimeUtc - UTC date time string
 * @returns {string} - date time string for email eg. '20 October 2023 at 11:10 am'
 */
const formatDateTimeForEmail = (dateTimeUtc) => {
    const submittedDate = new Date(dateTimeUtc);
    const formattedDate = submittedDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    // this is giving me weird times 0:41 pm for 12:41
    const formattedTime = submittedDate.toLocaleTimeString('en-GB', { hour12: true, hour: 'numeric', minute: 'numeric' });
    return `${formattedDate} at ${formattedTime}`;
  };

  module.exports = {
    formatDateTimeForEmail,
  };