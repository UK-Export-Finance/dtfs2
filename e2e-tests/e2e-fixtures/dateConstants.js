import {
  sub, add, format, getUnixTime,
} from 'date-fns';

const today = new Date();
const todayDay = format(today, 'dd');
const todayMonth = format(today, 'M');
const todayYear = format(today, 'yyyy');
const todayTaskFormat = format(today, 'dd MMM yyyy');

// to test cannot be issued in past
const fourDaysAgo = sub(today, { days: 4 });
const fourDaysAgoDay = format(fourDaysAgo, 'dd');
const fourDaysAgoMonth = format(fourDaysAgo, 'M');
const fourDaysAgoYear = format(fourDaysAgo, 'yyyy');
const oneMonth = add(today, { months: 1 });
const oneMonthDay = format(oneMonth, 'dd');
const oneMonthMonth = format(oneMonth, 'M');
const oneMonthYear = format(oneMonth, 'yyyy');
const twoMonths = add(today, { months: 2 });
const twoMonthsDay = format(twoMonths, 'dd');
const twoMonthsMonth = format(twoMonths, 'M');
const twoMonthsYear = format(twoMonths, 'yyyy');
// to test that if beyond issue/ coverstartdate limit
const tomorrow = add(today, { days: 1 });
const tomorrowDay = format(tomorrow, 'dd');
const tomorrowMonth = format(tomorrow, 'M');
const tomorrowYear = format(tomorrow, 'yyyy');
const threeMonths = add(today, { months: 3 });
const threeMonthsDay = format(threeMonths, 'dd');
const threeMonthsMonth = format(threeMonths, 'M');
const threeMonthsYear = format(threeMonths, 'yyyy');
const threeMonthsOneDay = add(today, { months: 3, days: 1 });
const threeMonthsOneDayDay = format(threeMonthsOneDay, 'dd');
const threeMonthsOneDayMonth = format(threeMonthsOneDay, 'M');
const threeMonthsOneDayYear = format(threeMonthsOneDay, 'yyyy');
const twentyEight = add(today, { days: 28 });
const twentyEightDay = format(twentyEight, 'dd');
const twentyEightMonth = format(twentyEight, 'M');
const twentyEightYear = format(twentyEight, 'yyyy');

const threeDaysAgo = sub(today, { days: 3 });
const threeDaysAgoUnix = getUnixTime(threeDaysAgo).toString();
const threeDaysDay = format(threeDaysAgo, 'dd');
const threeDaysMonth = format(threeDaysAgo, 'M');
const threeDaysYear = format(threeDaysAgo, 'yyyy');

const threeDaysAgoPlusMonth = add(threeDaysAgo, { months: 3 });

const todayUnix = getUnixTime(today).toString();
const todayUnixDay = format(threeDaysAgo, 'dd');
const todayUnixMonth = format(threeDaysAgo, 'M');
const todayUnixYear = format(threeDaysAgo, 'yyyy');

export default {
  today,
  todayDay,
  todayMonth,
  todayYear,
  tomorrow,
  tomorrowDay,
  tomorrowMonth,
  tomorrowYear,
  fourDaysAgo,
  fourDaysAgoDay,
  fourDaysAgoMonth,
  fourDaysAgoYear,
  oneMonth,
  oneMonthDay,
  oneMonthMonth,
  oneMonthYear,
  twoMonths,
  twoMonthsDay,
  twoMonthsMonth,
  twoMonthsYear,
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
  todayUnix,
  todayUnixDay,
  todayUnixMonth,
  todayUnixYear,
  threeDaysAgoPlusMonth,
  todayTaskFormat,
};
