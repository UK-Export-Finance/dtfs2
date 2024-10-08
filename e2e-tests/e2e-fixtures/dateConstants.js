const { sub, add, format, getUnixTime } = require('date-fns');

const shortDayFormat = 'd';
const longDayFormat = 'dd';
const shortMonthFormat = 'M';
const longMonthFormat = 'MM';
const longYearFormat = 'yyyy';

const today = new Date();
const todayDay = format(today, longDayFormat);
const todayMonth = format(today, longMonthFormat);
const todayYear = format(today, longYearFormat);
const todayFullString = format(today, 'dd MMM yyyy');

// to test cannot be issued in past
const fourDaysAgo = sub(today, { days: 4 });
const fourDaysAgoDay = format(fourDaysAgo, longDayFormat);
const fourDaysAgoMonth = format(fourDaysAgo, longMonthFormat);
const fourDaysAgoYear = format(fourDaysAgo, longYearFormat);
const fourDaysAgoFull = format(fourDaysAgo, 'd MMMM yyyy');

const yesterday = sub(today, { days: 1 });
const yesterdayUnix = getUnixTime(yesterday).toString();
const yesterdayDay = format(yesterday, longDayFormat);
const yesterdayMonth = format(yesterday, longMonthFormat);
const yesterdayYear = format(yesterday, longYearFormat);

const twoDaysAgo = sub(today, { days: 2 });

const oneMonth = add(today, { months: 1 });
const oneMonthUnix = getUnixTime(oneMonth).toString();
const oneMonthFormattedFull = format(oneMonth, 'dd MMMM yyyy');
const oneMonthFormattedTable = format(oneMonth, 'd MMMM yyyy');
const oneMonthFormattedShort = format(oneMonth, 'dd MMM yyyy');
const oneMonthDay = format(oneMonth, longDayFormat);
const oneMonthMonth = format(oneMonth, longMonthFormat);
const oneMonthYear = format(oneMonth, longYearFormat);

const twoMonths = add(today, { months: 2 });
const twoMonthsDay = format(twoMonths, longDayFormat);
const twoMonthsMonth = format(twoMonths, longMonthFormat);
const twoMonthsYear = format(twoMonths, longYearFormat);
const twoMonthsFormatted = format(twoMonths, 'dd MMM yyyy');
const twoMonthsFormattedFull = format(twoMonths, 'dd MMMM yyyy');
const twoMonthsFormattedTable = format(twoMonths, 'd MMMM yyyy');

// to test that if beyond issue/ cover start date limit
const tomorrow = add(today, { days: 1 });
const tomorrowDay = format(tomorrow, longDayFormat);
const tomorrowMonth = format(tomorrow, longMonthFormat);
const tomorrowYear = format(tomorrow, longYearFormat);

const twoDays = add(today, { days: 2 });
const twoDaysDay = format(twoDays, longDayFormat);
const twoDaysMonth = format(twoDays, longMonthFormat);
const twoDaysYear = format(twoDays, longYearFormat);

// 25 days ago
const twentyFiveDaysAgo = sub(today, { days: 25 });
const twentyFiveDaysAgoUnix = getUnixTime(twentyFiveDaysAgo).toString();
const twentyFiveDaysAgoFormatted = format(twentyFiveDaysAgo, 'dd MMM yyyy');

// 35 days ago
const thirtyFiveDaysAgo = sub(today, { days: 35 });
const thirtyFiveDaysAgoUnix = getUnixTime(thirtyFiveDaysAgo).toString();
const thirtyFiveDaysAgoFormatted = format(thirtyFiveDaysAgo, 'dd MMM yyyy');

const threeMonths = add(today, { months: 3 });
const threeMonthsDay = format(threeMonths, longDayFormat);
const threeMonthsMonth = format(threeMonths, longMonthFormat);
const threeMonthsYear = format(threeMonths, longYearFormat);

const threeMonthsOneDay = add(today, { months: 3, days: 1 });
const threeMonthsOneDayDay = format(threeMonthsOneDay, longDayFormat);
const threeMonthsOneDayMonth = format(threeMonthsOneDay, longMonthFormat);
const threeMonthsOneDayYear = format(threeMonthsOneDay, longYearFormat);
const threeMonthsOneDayFullString = format(threeMonthsOneDay, 'dd MMM yyyy');
const threeMonthsOneDayFullMonthString = format(threeMonthsOneDay, 'd MMMM yyyy');

const twentyEight = add(today, { days: 28 });
const twentyEightDay = format(twentyEight, longDayFormat);
const twentyEightMonth = format(twentyEight, longMonthFormat);
const twentyEightYear = format(twentyEight, longYearFormat);

const threeDaysAgo = sub(today, { days: 3 });
const threeDaysAgoUnix = getUnixTime(threeDaysAgo).toString();
const threeDaysDay = format(threeDaysAgo, longDayFormat);
const threeDaysMonth = format(threeDaysAgo, longMonthFormat);
const threeDaysYear = format(threeDaysAgo, longYearFormat);

const sevenDaysAgo = sub(today, { days: 7 });
const sevenDaysAgoUnix = getUnixTime(sevenDaysAgo).toString();
const sevenDaysAgoDay = format(sevenDaysAgo, longDayFormat);
const sevenDaysAgoMonth = format(sevenDaysAgo, longMonthFormat);
const sevenDaysAgoYear = format(sevenDaysAgo, longYearFormat);

const sevenDays = add(today, { days: 7 });
const sevenDaysUnix = getUnixTime(sevenDays).toString();
const sevenDaysDay = format(sevenDays, longDayFormat);
const sevenDaysMonth = format(sevenDays, longMonthFormat);
const sevenDaysYear = format(sevenDays, longYearFormat);

const twoYears = add(today, { years: 2, months: 3, days: 1 });
const twoYearsDay = format(twoYears, longDayFormat);
const twoYearsMonth = format(twoYears, longMonthFormat);
const twoYearsYear = format(twoYears, longYearFormat);

const twoYearsAgo = sub(today, { years: 2 });
const twoYearsAgoUnix = getUnixTime(twoYearsAgo).toString();
const twoYearsAgoDay = format(twoYearsAgo, longDayFormat);
const twoYearsAgoMonth = format(twoYearsAgo, longMonthFormat);
const twoYearsAgoYear = format(twoYearsAgo, longYearFormat);

const threeYearsAgo = sub(today, { years: 3 });
const threeYearsAgoDay = format(threeYearsAgo, longDayFormat);
const threeYearsAgoMonth = format(threeYearsAgo, longMonthFormat);
const threeYearsAgoYear = format(threeYearsAgo, longYearFormat);

const oneYearAgo = sub(today, { years: 1 });
const oneYearUnix = getUnixTime(oneYearAgo).toString();
const oneYearAgoDay = format(oneYearAgo, longDayFormat);
const oneYearAgoMonth = format(oneYearAgo, longMonthFormat);
const oneYearAgoYear = format(oneYearAgo, longYearFormat);

const threeYears = add(today, { years: 3, months: 3, days: 1 });
const threeYearsDay = format(threeYears, longDayFormat);
const threeYearsMonth = format(threeYears, longMonthFormat);
const threeYearsYear = format(threeYears, longYearFormat);

const threeDaysAgoPlusMonth = add(threeDaysAgo, { months: 3 });

const sixYearsOneDay = add(today, { years: 6, months: 0, days: 1 });
const sixYearsOneDayDay = format(sixYearsOneDay, longDayFormat);
const sixYearsOneDayMonth = format(sixYearsOneDay, longMonthFormat);
const sixYearsOneDayYear = format(sixYearsOneDay, longYearFormat);

const todayUnix = getUnixTime(today).toString();
const todayUnixDay = format(threeDaysAgo, longDayFormat);
const todayUnixMonth = format(threeDaysAgo, longMonthFormat);
const todayUnixYear = format(threeDaysAgo, longYearFormat);

const todayFormattedFull = format(today, 'dd MMMM yyyy');
const todayFormatted = format(today, 'd MMMM yyyy');
const todayFormattedShort = format(today, 'dd MMM yyyy');
const tomorrowFormattedFull = format(tomorrow, 'd MMMM yyyy');
const tomorrowFormattedFacilityPage = format(tomorrow, 'dd MMM yyyy');
const tomorrowUnix = getUnixTime(tomorrow).toString();

const todayFormattedTimeHours = format(today, 'h');
const todayFormattedTimeAmPm = format(today, 'aaa');

module.exports = {
  shortDayFormat,
  longDayFormat,
  shortMonthFormat,
  longMonthFormat,
  longYearFormat,
  today,
  todayDay,
  todayMonth,
  todayYear,
  tomorrow,
  tomorrowDay,
  tomorrowMonth,
  tomorrowYear,
  tomorrowUnix,
  twoDays,
  twoDaysDay,
  twoDaysMonth,
  twoDaysYear,
  twentyFiveDaysAgo,
  twentyFiveDaysAgoUnix,
  twentyFiveDaysAgoFormatted,
  thirtyFiveDaysAgo,
  thirtyFiveDaysAgoUnix,
  thirtyFiveDaysAgoFormatted,
  yesterday,
  yesterdayDay,
  yesterdayMonth,
  yesterdayYear,
  yesterdayUnix,
  twoDaysAgo,
  fourDaysAgo,
  fourDaysAgoDay,
  fourDaysAgoMonth,
  fourDaysAgoYear,
  fourDaysAgoFull,
  oneMonth,
  oneMonthUnix,
  oneMonthFormattedTable,
  oneMonthFormattedFull,
  oneMonthFormattedShort,
  oneMonthDay,
  oneMonthMonth,
  oneMonthYear,
  twoMonths,
  twoMonthsDay,
  twoMonthsMonth,
  twoMonthsYear,
  twoMonthsFormatted,
  twoMonthsFormattedFull,
  twoMonthsFormattedTable,
  threeMonths,
  threeMonthsDay,
  threeMonthsMonth,
  threeMonthsYear,
  threeMonthsOneDay,
  threeMonthsOneDayDay,
  threeMonthsOneDayMonth,
  threeMonthsOneDayYear,
  sixYearsOneDay,
  threeMonthsOneDayFullString,
  threeMonthsOneDayFullMonthString,
  sixYearsOneDayDay,
  sixYearsOneDayMonth,
  sixYearsOneDayYear,
  twentyEight,
  twentyEightDay,
  twentyEightMonth,
  twentyEightYear,
  threeDaysAgo,
  threeDaysAgoUnix,
  threeDaysDay,
  threeDaysMonth,
  threeDaysYear,
  sevenDaysAgo,
  sevenDaysAgoUnix,
  sevenDaysAgoDay,
  sevenDaysAgoMonth,
  sevenDaysAgoYear,
  sevenDays,
  sevenDaysUnix,
  sevenDaysDay,
  sevenDaysMonth,
  sevenDaysYear,
  todayUnix,
  todayUnixDay,
  todayUnixMonth,
  todayUnixYear,
  threeDaysAgoPlusMonth,
  todayFullString,
  todayFormattedFull,
  todayFormatted,
  todayFormattedShort,
  tomorrowFormattedFull,
  tomorrowFormattedFacilityPage,
  todayFormattedTimeHours,
  todayFormattedTimeAmPm,
  twoYears,
  twoYearsDay,
  twoYearsMonth,
  twoYearsYear,
  twoYearsAgo,
  twoYearsAgoUnix,
  twoYearsAgoDay,
  twoYearsAgoMonth,
  twoYearsAgoYear,
  threeYearsAgoDay,
  threeYearsAgoMonth,
  threeYearsAgoYear,
  threeYears,
  threeYearsDay,
  threeYearsMonth,
  threeYearsYear,
  oneYearAgo,
  oneYearUnix,
  oneYearAgoDay,
  oneYearAgoMonth,
  oneYearAgoYear,
};
