"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLongFormattedDate = exports.getStartOfDateFromDayMonthYearStringsReplicatingMoment = exports.getStartOfDateFromDayMonthYearStrings = exports.getStartOfDateFromEpochMillisecondString = exports.getNowAsEpochMillisecondString = exports.getDateAsEpochMillisecondString = exports.getNowAsEpoch = void 0;
const date_fns_1 = require("date-fns");
const constants_1 = require("../../constants");
/**
 * Returns the current datetime as a 13 digit Unix timestamp: the time in
 * milliseconds that has elapsed since 1st January 1970 (UTC).
 *
 * e.g. A Unix timestamp of 1702900314 is equivalent to an ISO 8601 date time
 * stamp of '2023-12-18T11:51:54Z'
 * @returns {Number} The current date and time as a 13 digit Unix timestamp (EPOCH)
 */
const getNowAsEpoch = () => Date.now();
exports.getNowAsEpoch = getNowAsEpoch;
/**
 * @param date
 * @returns Date as Unix timestamp representing the number of milliseconds between this date and 1st
 * January 1970 (UTC), stored as a string.
 */
const getDateAsEpochMillisecondString = (date) => date.valueOf().toString();
exports.getDateAsEpochMillisecondString = getDateAsEpochMillisecondString;
/**
 * @returns Current date as Unix timestamp representing the number of milliseconds between now and 1st
 * January 1970 (UTC), stored as a string.
 */
const getNowAsEpochMillisecondString = () => (0, exports.getDateAsEpochMillisecondString)(new Date());
exports.getNowAsEpochMillisecondString = getNowAsEpochMillisecondString;
/**
 *
 * @param value Unix timestamp representing the number of milliseconds between the date and 1st
 * January 1970 (UTC), stored as a string.
 * @returns The start of the day representing this timestamp
 */
const getStartOfDateFromEpochMillisecondString = (value) => (0, date_fns_1.startOfDay)(new Date(Number(value)));
exports.getStartOfDateFromEpochMillisecondString = getStartOfDateFromEpochMillisecondString;
/**
 * @param day the day of the month as a string
 * @param month month of the year as a string, starting at `1` = January
 * @param year year as a string
 * @returns start of the date
 */
const getStartOfDateFromDayMonthYearStrings = (day, month, year) => (0, date_fns_1.set)((0, date_fns_1.startOfDay)(new Date()), {
    date: Number(day),
    month: Number(month) - 1, // Months are zero indexed
    year: Number(year),
});
exports.getStartOfDateFromDayMonthYearStrings = getStartOfDateFromDayMonthYearStrings;
/**
 * @param day the day of the month as a string
 * @param month month of the year as a string, starting at `1` = January
 * @param year year as a string
 * @returns start of the date
 *
 * This function has odd behaviour inherited from moment js:
 *  - If the month is invalid return NaN
 *  - If the day/year is invalid, use the current day/year instead
 *  - If the input day is invalid, current date is 29th February, and setting year to a non-leap year, use 28th instead
 *  - If the current date is too large for the given month (e.g. 31st November), wrap (e.g to 1st December)
 */
const getStartOfDateFromDayMonthYearStringsReplicatingMoment = (day, month, year) => {
    // TODO: DTFS2-7024 Remove the odd behaviour inherited from moment js
    // moment().set() returns invalid date if the month is invalid
    if (Number.isNaN(Number(month))) {
        return new Date(NaN);
    }
    const currentYear = new Date().getFullYear();
    const currentDate = new Date().getDate();
    // moment().set() treats NaN year as the current year
    const parsedYear = Number.isNaN(Number(year)) ? currentYear : Number(year);
    let parsedDay = Number(day);
    if (Number.isNaN(parsedDay)) {
        // If the inputted day is invalid, current date is 29th February, and the parsedYear is not a leap year moment uses the current date as 28 instead
        const use28thFebruary = !(0, date_fns_1.isLeapYear)(parsedYear) && currentDate === 29 && (new Date).getMonth() === 1;
        if (use28thFebruary) {
            parsedDay = 28;
        }
        else {
            parsedDay = currentDate;
        }
    }
    return (0, date_fns_1.set)((0, date_fns_1.startOfDay)(new Date()), {
        date: parsedDay,
        month: Number(month) - 1, // months are zero indexed
        year: parsedYear,
    });
};
exports.getStartOfDateFromDayMonthYearStringsReplicatingMoment = getStartOfDateFromDayMonthYearStringsReplicatingMoment;
/**
 * @returns date formatted as `do MMMM yyyy`, e.g. 1st February 2024
 */
const getLongFormattedDate = (date) => (0, date_fns_1.format)(date, constants_1.DATE_FORMATS.LONG_FORM_DATE);
exports.getLongFormattedDate = getLongFormattedDate;
