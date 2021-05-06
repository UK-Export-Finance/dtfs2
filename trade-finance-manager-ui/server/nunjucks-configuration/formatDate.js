
import moment from 'moment';

require('moment-timezone');// monkey-patch to provide moment().tz()

const formatDate = (dateStr, format = 'YYYY-MM-DD') => {
  if (!dateStr) {
    return '';
  }

  return moment.utc(dateStr).format(format);
};

export default formatDate;
