import {
  sub, add, format, getUnixTime,
} from 'date-fns';

const today = new Date();
const todayDay = format(today, 'dd');
const todayMonth = format(today, 'MM');
const todayYear = format(today, 'yyyy');
const todayTaskFormat = format(today, 'dd MMM yyyy');

// to test cannot be issued in past
const fourDaysAgo = sub(today, { days: 4 });
const fourDaysAgoDay = format(fourDaysAgo, 'dd');
const fourDaysAgoMonth = format(fourDaysAgo, 'MM');
const fourDaysAgoYear = format(fourDaysAgo, 'yyyy');
const fourDaysAgoFull = format(fourDaysAgo, 'd MMMM yyyy');

const yesterday = sub(today, { days: 1 });
const yesterdayUnix = getUnixTime(yesterday).toString();
const yesterdayDay = format(yesterday, 'dd');
const yesterdayMonth = format(yesterday, 'MM');
const yesterdayYear = format(yesterday, 'yyyy');

const oneMonth = add(today, { months: 1 });
const oneMonthUnix = getUnixTime(oneMonth).toString();
const oneMonthFormattedFull = format(oneMonth, 'dd MMMM yyyy');
const oneMonthFormattedTable = format(oneMonth, 'd MMMM yyyy');
const oneMonthFormattedShort = format(oneMonth, 'dd MMM yyyy');
const oneMonthDay = format(oneMonth, 'dd');
const oneMonthMonth = format(oneMonth, 'MM');
const oneMonthYear = format(oneMonth, 'yyyy');

const twoMonths = add(today, { months: 2 });
const twoMonthsDay = format(twoMonths, 'dd');
const twoMonthsMonth = format(twoMonths, 'MM');
const twoMonthsYear = format(twoMonths, 'yyyy');
const twoMonthsFormatted = format(twoMonths, 'dd MMM yyyy');
const twoMonthsFormattedFull = format(twoMonths, 'dd MMMM yyyy');
const twoMonthsFormattedTable = format(twoMonths, 'd MMMM yyyy');

// to test that if beyond issue/ cover start date limit
const tomorrow = add(today, { days: 1 });
const tomorrowDay = format(tomorrow, 'dd');
const tomorrowMonth = format(tomorrow, 'MM');
const tomorrowYear = format(tomorrow, 'yyyy');

const twoDays = add(today, { days: 2 });
const twoDaysDay = format(twoDays, 'dd');
const twoDaysMonth = format(twoDays, 'MM');
const twoDaysYear = format(twoDays, 'yyyy');

// 25 days ago
const twentyFiveDaysAgo = sub(today, { days: 25 });
const twentyFiveDaysAgoUnix = getUnixTime(twentyFiveDaysAgo).toString();
const twentyFiveDaysAgoFormatted = format(twentyFiveDaysAgo, 'dd MMM yyyy');

// 35 days ago
const thirtyFiveDaysAgo = sub(today, { days: 35 });
const thirtyFiveDaysAgoUnix = getUnixTime(thirtyFiveDaysAgo).toString();
const thirtyFiveDaysAgoFormatted = format(thirtyFiveDaysAgo, 'dd MMM yyyy');

const threeMonths = add(today, { months: 3 });
const threeMonthsDay = format(threeMonths, 'dd');
const threeMonthsMonth = format(threeMonths, 'MM');
const threeMonthsYear = format(threeMonths, 'yyyy');

const threeMonthsOneDay = add(today, { months: 3, days: 1 });
const threeMonthsOneDayDay = format(threeMonthsOneDay, 'dd');
const threeMonthsOneDayMonth = format(threeMonthsOneDay, 'MM');
const threeMonthsOneDayYear = format(threeMonthsOneDay, 'yyyy');

const twentyEight = add(today, { days: 28 });
const twentyEightDay = format(twentyEight, 'dd');
const twentyEightMonth = format(twentyEight, 'MM');
const twentyEightYear = format(twentyEight, 'yyyy');

const threeDaysAgo = sub(today, { days: 3 });
const threeDaysAgoUnix = getUnixTime(threeDaysAgo).toString();
const threeDaysDay = format(threeDaysAgo, 'dd');
const threeDaysMonth = format(threeDaysAgo, 'MM');
const threeDaysYear = format(threeDaysAgo, 'yyyy');

const sevenDaysAgo = sub(today, { days: 7 });
const sevenDaysAgoUnix = getUnixTime(sevenDaysAgo).toString();
const sevenDaysAgoDay = format(sevenDaysAgo, 'dd');
const sevenDaysAgoMonth = format(sevenDaysAgo, 'MM');
const sevenDaysAgoYear = format(sevenDaysAgo, 'yyyy');

const sevenDays = add(today, { days: 7 });
const sevenDaysUnix = getUnixTime(sevenDays).toString();
const sevenDaysDay = format(sevenDays, 'dd');
const sevenDaysMonth = format(sevenDays, 'MM');
const sevenDaysYear = format(sevenDays, 'yyyy');

const twoYears = add(today, { years: 2, months: 3, days: 1 });
const twoYearsDay = format(twoYears, 'dd');
const twoYearsMonth = format(twoYears, 'MM');
const twoYearsYear = format(twoYears, 'yyyy');

const twoYearsAgo = sub(today, { years: 2 });
const twoYearsAgoUnix = getUnixTime(twoYearsAgo).toString();
const twoYearsAgoDay = format(twoYearsAgo, 'dd');
const twoYearsAgoMonth = format(twoYearsAgo, 'MM');
const twoYearsAgoYear = format(twoYearsAgo, 'yyyy');

const oneYearAgo = sub(today, { years: 1 });
const oneYearUnix = getUnixTime(oneYearAgo).toString();
const oneYearAgoDay = format(oneYearAgo, 'dd');
const oneYearAgoMonth = format(oneYearAgo, 'MM');
const oneYearAgoYear = format(oneYearAgo, 'yyyy');

const threeYears = add(today, { years: 3, months: 3, days: 1 });
const threeYearsDay = format(threeYears, 'dd');
const threeYearsMonth = format(threeYears, 'MM');
const threeYearsYear = format(threeYears, 'yyyy');

const threeDaysAgoPlusMonth = add(threeDaysAgo, { months: 3 });

const todayUnix = getUnixTime(today).toString();
const todayUnixDay = format(threeDaysAgo, 'dd');
const todayUnixMonth = format(threeDaysAgo, 'MM');
const todayUnixYear = format(threeDaysAgo, 'yyyy');

const todayFormattedFull = format(today, 'dd MMMM yyyy');
const todayFormatted = format(today, 'd MMMM yyyy');
const todayFormattedShort = format(today, 'dd MMM yyyy');
const tomorrowFormattedFull = format(tomorrow, 'd MMMM yyyy');
const tomorrowFormattedFacilityPage = format(tomorrow, 'dd MMM yyyy');
const tomorrowUnix = getUnixTime(tomorrow).toString();

const todayFormattedTimeHours = format(today, 'h');
const todayFormattedTimeAmPm = format(today, 'aaa');

export default {
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
  todayTaskFormat,
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
