"use strict";
/**
 * Coverts date to format for email '20 October 2023 at 11:10 am'
 * @param {Date} date
 * @returns {string} - date time string for email eg. '20 October 2023 at 11:10 am'
 */
const formatDateForEmail = (date) => {
    const formattedDate = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-GB', { hourCycle: 'h12', hour: 'numeric', minute: 'numeric' });
    return `${formattedDate} at ${formattedTime}`;
};
module.exports = {
    formatDateForEmail,
};
