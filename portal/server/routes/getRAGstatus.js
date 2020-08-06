// import moment from 'moment';
// import CONSTANTS from '../constants';

const ONE_DAY = 86400000; // milliseconds

const getExpiryDate = (val, days) => {
  const expiry = parseInt(val.createdDate, 10) + (days * ONE_DAY);
  const id = val.deal_id;
  const remainingDays = Math.floor((expiry - Date.now()) / ONE_DAY);
  return {
    ...val,
    id,
    expiry,
    remainingDays,
  };
};

const getRAGstatus = (facilities, days) => {
  const trafficLights = {
    black: 0,
    red: 0,
    orange: 0,
    green: 0,
  };

  const limits = {
    dayBands90: { red: 16, orange: 46, green: 90 },
    dayBands20: { red: 7, orange: 14, green: 20 },
    dayBands10: { red: 6, orange: 8, green: 10 },
  };

  const bands = `dayBands${days}`;
  const dayLimits = limits[bands];
  console.log(dayLimits);


  if (!facilities) {
    return trafficLights;
  }

  const facilitiesWithExpiryDate = facilities.map(
    // use anon function to pass in number of days to calculate expiry
    // eslint-disable-next-line func-names
    (facility) => getExpiryDate(facility, days),
  );

  facilitiesWithExpiryDate.forEach((item) => {
    // console.log(item.id, item.remainingDays);
    if (item.remainingDays < 0) {
      trafficLights.black += 1;
    } else if (item.remainingDays < dayLimits.red) {
      trafficLights.red += 1;
    } else if (item.remainingDays < dayLimits.orange) {
      trafficLights.orange += 1;
    } else if (item.remainingDays < dayLimits.green) {
      trafficLights.green += 1;
    } else {
      trafficLights.black += 1;
    }
  });
  return trafficLights;
};

export default getRAGstatus;
