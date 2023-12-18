const { addMonths, startOfMonth } = require('date-fns');

/**
 * @param {{start: Date, end: Date}} interval - time period with start and end dates
 * @returns {Date[]} - array of dates every 3 months between interval, including start & end dates
 */
const eachThreeMonthsOfInterval = (interval) => {
    let incrementalDate = interval.start;
    const endDate = interval.end;
    const quarterDates = [];
    while (incrementalDate <= endDate) {
        quarterDates.push(startOfMonth(incrementalDate));
        incrementalDate = addMonths(incrementalDate, 3);
    };
    return quarterDates;
};

module.exports = {
    eachThreeMonthsOfInterval,
};
