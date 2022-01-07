import {
  sub, add, format, getUnixTime,
} from 'date-fns';

const today = new Date();
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

export default {
  today,
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
};
