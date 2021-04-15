/* eslint-disable no-underscore-dangle */
// Premium Schedule API returns the premium schedule for a given facility
//
// the flow is:
// 1) Post parameters to Premium Schedule API, returns  header location to load the segments
// 2) Premium Schedule Segments gets the segments by facilityURN
const axios = require('axios');
const mapPremiumScheduleFalicity = require('../mappings/mapPremiumScheduleFacility');

const postPremiumSchedule = async (facility, facilityExposurePeriod) => {
  const data = mapPremiumScheduleFalicity(facility, facilityExposurePeriod);

  if (!data) {
    console.log('facility data not valid for premium schedule');
    return null;
  }
  const config = {
    method: 'post',
    url: `${process.env.MULESOFT_API_UKEF_MDM_EA_URL}/premium/schedule`,
    auth: {
      username: process.env.MULESOFT_API_UKEF_MDM_EA_KEY,
      password: process.env.MULESOFT_API_UKEF_MDM_EA_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  };

  const response = await axios(config);
  if (response.status) {
    return response.status;
  }
  if (response && response.response && response.response.status) {
    return response.response.status;
  }

  // eslint-disable-next-line no-underscore-dangle
  return new Error(`Error calling Post Premium schedule. facilityURN:${facility._id}`);
};

const getScheduleData = async (facilityURN) => {
  const url = `${process.env.MULESOFT_API_UKEF_MDM_EA_URL}/premium/segments/${facilityURN}`;
  const response = await axios({
    method: 'get',
    url,
    auth: {
      username: process.env.MULESOFT_API_UKEF_MDM_EA_KEY,
      password: process.env.MULESOFT_API_UKEF_MDM_EA_SECRET,
    },
  }).catch((catchErr) => catchErr);
  if (response) {
    return response;
  }

  // eslint-disable-next-line no-underscore-dangle
  return new Error(`Error getting Premium schedule segments. Facility:${facilityURN}`);
};

const getPremiumSchedule = async (req, res) => {
  const { facility, facilityExposurePeriod } = req.body;
  const postPremiumScheduleResponse = await postPremiumSchedule(facility, facilityExposurePeriod);
  if (!postPremiumScheduleResponse) {
    console.log('no postPremiumScheduleResponse');
    return res.status(400).send();
  }
  if (postPremiumScheduleResponse === 200 || postPremiumScheduleResponse === 201) {
    const response = await getScheduleData(Number(facility.ukefFacilityID));
    if (response.status === 200 || response.status === 201) {
      return res.status(response.status).send(response.data);
    }
  }
  return new Error(`Error calling Premium schedule. Facility:${facility.ukefFacilityId}`);
};
exports.getPremiumSchedule = getPremiumSchedule;
