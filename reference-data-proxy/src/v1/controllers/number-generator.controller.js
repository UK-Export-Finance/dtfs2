const axios = require('axios');
const CONSTANTS = require('../../constants');
const {
  checkDealId,
  checkFacilityId,
} = require('./acbs.controller');

const numberTypeIsValid = (numberType) => {
  if (!Object.values(CONSTANTS.NUMBER_GENERATOR.NUMBER_TYPE).includes(numberType)) {
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

  const { maskedId: id } = response.data;

  return id;
};

const checkId = async (entityType, id) => {
  if (entityType === CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL) {
    const dealIdStatus = await checkDealId(id);
    console.log(`Checked dealId ${id} with ACBS API: ${dealIdStatus}`);
    return dealIdStatus;
  }

  if (entityType === CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY) {
    const facilityIdStatus = await checkFacilityId(id);
    console.log(`Checked facilityId ${id} with ACBS API: ${facilityIdStatus}`);
    return facilityIdStatus;
  }

  return null;
};

exports.create = async (req, res) => {
  const { entityType } = req.params;

  let numberType;

  if (entityType === CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL
    || entityType === CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY) {
    numberType = 1;
  }

  if (!numberTypeIsValid(numberType)) {
    const message = `must be ${CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL} or ${CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY}`;
    return res.status(400).send(`Invalid entity type - ${message}`);
  }

  const createAndValidateId = () => new Promise((resolve) => {
    let numberGeneratorId;
    let completed = true;
    let pending = false;
    let totalCalls = 0;

    const interval = setInterval(async () => {
      totalCalls = totalCalls + 1;
      if (totalCalls === 1) {
        completed = false;
      }

      if (!pending && !completed && !numberGeneratorId) {
        pending = true;
        numberGeneratorId = await callNumberGeneratorApi(numberType);

        const statusCode = await checkId(entityType, numberGeneratorId);

        if (statusCode === 404) {
          // deal id is not being used, so we can use it.
          completed = true;
          clearInterval(interval);
          return resolve(numberGeneratorId);
        }

        // wipe the state so that API's are called again.
        pending = false;
        completed = false;
        numberGeneratorId = null;
        return numberGeneratorId;
      }
    }, 10);
  });

  const validId = await createAndValidateId();

  return res.status(200).send({
    id: validId,
  });
};
