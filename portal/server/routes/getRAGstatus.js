const ONE_DAY = 86400000; // milliseconds

// get expiry date based on count from creation date
// TODO change for MIA
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
    dayBands28: { red: 9, orange: 18, green: 28 }, // set to include weekends for working days
    dayBands14: { red: 8, orange: 10, green: 14 },
  };
  const bands = `dayBands${days}`;
  const dayLimits = limits[bands];

  if (!facilities) {
    return trafficLights;
  }

  const facilitiesWithExpiryDate = facilities.map(
    // use anon function to pass in number of days to calculate expiry
    // eslint-disable-next-line func-names
    (facility) => getExpiryDate(facility, days),
  );

  facilitiesWithExpiryDate.forEach((item) => {
    if (item.remainingDays < 0) {
      // flag as overdue AND count in lowest bucket
      trafficLights.black += 1;
      trafficLights.red += 1;
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
  // console.log(trafficLights);
  return trafficLights;
};

export default getRAGstatus;
