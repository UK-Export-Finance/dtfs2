// import moment from 'moment';
// import CONSTANTS from '../constants';

const ONE_DAY = 86400000; // milliseconds
// const NINETY_DAYS = 7776000000; // milliseconds
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

const getRAGstatus = (facilities) => {
  const trafficLights = {
    black: 0,
    red: 0,
    orange: 0,
    green: 0,
  };


  if (!facilities) {
    return trafficLights;
  }

  const facilitiesWithExpiryDate = facilities.map(
    // use anon function to pass in number of days to calculate expiry
    // eslint-disable-next-line func-names
    (facility) => getExpiryDate(facility, 90),
  );

  facilitiesWithExpiryDate.forEach((item) => {
    // console.log(item.id, item.remainingDays);
    if (item.remainingDays < 0) {
      trafficLights.black += 1;
    } else if (item.remainingDays < 16) {
      trafficLights.red += 1;
    } else if (item.remainingDays < 46) {
      trafficLights.orange += 1;
    } else if (item.remainingDays < 90) {
      trafficLights.green += 1;
    } else {
      trafficLights.black += 1;
    }
  });
  return trafficLights;
};

export default getRAGstatus;
