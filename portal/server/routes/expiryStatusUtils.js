import api from '../api';
import buildReportFilters from './buildReportFilters';
import {
  getApiData,
  requestParams,
} from '../helpers';

const ONE_DAY = 86400000; // milliseconds
const PAGESIZE = 20;

// get expiry date based on count from creation date
// TODO change for MIA
const addExpiryDate = (val, days, isDeal) => {
  let created = val.createdDate;
  let id = val.deal_id;
  if (isDeal) {
    created = val.details.approvalDate;
    id = val._id; // eslint-disable-line no-underscore-dangle
  }
  const expiry = parseInt(created, 10) + (days * ONE_DAY);
  const remainingDays = Math.floor((expiry - Date.now()) / ONE_DAY);
  // console.log(id, created, expiry, remainingDays);
  return {
    ...val,
    id,
    expiry,
    remainingDays,
  };
};

const getExpiryDates = (facilities, days, isDeal) => {
  const facilitiesWithExpiryDate = facilities.map(
    // use anon function to pass in number of days to calculate expiry
    // eslint-disable-next-line func-names
    (facility) => addExpiryDate(facility, days, isDeal),
  );
  facilitiesWithExpiryDate.sort((a, b) => parseFloat(a.remainingDays) - parseFloat(b.remainingDays));
  return facilitiesWithExpiryDate;
};

const getRAGstatus = (facilities, days, isDeal) => {
  const trafficLights = {
    negative: 0,
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
    (facility) => addExpiryDate(facility, days, isDeal),
  );

  facilitiesWithExpiryDate.forEach((item) => {
    if (item.remainingDays < 0) {
      // flag as overdue AND count in lowest bucket
      trafficLights.negative += 1;
      trafficLights.red += 1;
    } else if (item.remainingDays < dayLimits.red) {
      trafficLights.red += 1;
    } else if (item.remainingDays < dayLimits.orange) {
      trafficLights.orange += 1;
    } else if (item.remainingDays < dayLimits.green) {
      trafficLights.green += 1;
    } else {
      trafficLights.negative += 1;
    }
  });
  // console.log(trafficLights);
  return trafficLights;
};
const getMIAData = async (req, res, filterByDealStatus) => {
  const { userToken } = requestParams(req);
  let maxDays = 10;
  let workingDays = 14;
  if (filterByDealStatus === 'Accepted by UKEF (with conditions)') {
    workingDays = 28;
    maxDays = 20;
  }
  const fromDays = req.query.fromDays || 0;
  const toDays = req.query.toDays || maxDays;

  const submissionFilters = {
    filterBySubmissionType: 'manualInclusionApplication',
  };

  const MIAfilters = buildReportFilters(submissionFilters, req.session.user);
  const applications = await getApiData(
    api.contracts(0, 0, MIAfilters, userToken),
    res,
  );

  let miaWithConditions = [];
  let tempDeals = [];
  let deals = [];
  let count = 0;
  if (applications.deal) {
    miaWithConditions = applications.deals.filter((deal) => (deal.status === filterByDealStatus));
    tempDeals = getExpiryDates(miaWithConditions, workingDays, true);
    // once we have the deals and expriy dates, filter the display
    if (fromDays > 0) {
      deals = tempDeals.filter(
        (deal) => deal.remainingDays >= fromDays && deal.remainingDays <= toDays,
      );
    } else {
      deals = tempDeals.filter(
        (deal) => deal.remainingDays <= toDays,
      );
    }
    count = deals.length;
  }

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };
  return { deals, pages };
};

export {
  getRAGstatus,
  getExpiryDates,
  getMIAData,
};
