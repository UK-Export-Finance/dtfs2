import moment from 'moment';

const formatDateString = (dateStr, fromFormat, toFormat = 'D MMM YYYY') =>
  moment(dateStr, fromFormat).format(toFormat);

export default formatDateString;
