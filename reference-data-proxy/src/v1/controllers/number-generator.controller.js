const axios = require('axios');
const CONSTANTS = require('../../constants');
const {
  checkDealId,
  checkFacilityId,
} = require('./acbs.controller');

const numberTypeIsValid = (numberType) => {
  if (!Object.values(CONSTANTS.NUMBER_GENERATOR).includes(numberType)) {
    return false;
  }

  return true;
};

const callNumberGeneratorApi = async (numberType) => {
  const response = await axios({
    method: 'post',
    url: process.env.MULESOFT_API_NUMBER_GENERATOR_URL,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
    data: [
      {
        numberTypeId: numberType,
        createdBy: 'Portal v2/TFM',
        requestingSystem: 'Portal v2/TFM',
      },
    ],
  }).catch((catchErr) => catchErr);

  return response;
};


const checkId = async (entityType, id) => {
  // TODO: constants
  if (entityType === 'deal') {
    const dealIdStatus = await checkDealId(id);
    console.log(`Checked dealId ${id} with ACBS API: ${dealIdStatus}`);
    return dealIdStatus;
  }

  if (entityType === 'facility') {
    const facilityIdStatus = await checkFacilityId(id);
    console.log(`Checked facilityId ${id} with ACBS API: ${facilityIdStatus}`);
    return facilityIdStatus;
  }

  return null;
};

exports.create = async (req, res) => {
  const { entityType } = req.params;
  let numberType;

  // TODO: constants
  if (entityType === 'deal' || entityType === 'facility') {
    numberType = 1;
  }

  if (!numberTypeIsValid(numberType)) {
    return res.status(400).send('Invalid number type.');
  }

  return new Promise(() => {
    const interval = setInterval(async () => {
      const { data } = await callNumberGeneratorApi(numberType);

      const numberGeneratorId = data.maskedId;
      const statusCode = await checkId(entityType, numberGeneratorId);

      if (statusCode === 404) {
        // deal id is not being used, so we can use it.
        clearInterval(interval);
        return res.status(200).send({
          id: numberGeneratorId,
        });
      }

      return numberGeneratorId;
      // TODO: how often should we call? 
    }, 6000);
  });
};
