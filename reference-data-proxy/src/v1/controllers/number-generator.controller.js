// Number Generator API is used to get a new deal/facility id.
// However, the id might already be in use so we need to check it with ACBS.
//
// the flow is:
// 1) Call number generator Aure function
// 2) return a PENDING status while Azure function runs indepentantly
// 3) Create a scheduled job to keep checking the Azure function status


const axios = require('axios');
const durableFunctionsLogController = require('./durable-functions-log.controller');

const numberGeneratorFunctionUrl = process.env.AZURE_NUMBER_GENERATOR_FUNCTION_URL;

const callNumberGenerator = async ({
  dealType, entityType, entityId, dealId, user,
}) => {
  const response = await axios({
    method: 'post',
    url: `${numberGeneratorFunctionUrl}/api/orchestrators/numbergenerator`,
    data: {
      dealType,
      entityType,
      entityId,
      dealId,
      user,
    },
  }).catch((err) => ({ err }));

  if (response.err) {
    return durableFunctionsLogController.addDurableFunctionLog({
      type: 'NUMBER_GENERATOR',
      data: {
        error: response.err,
      },
    });
  }

  const { id: instanceId, ...numberGeneratorFunctionUrls } = response.data;

  await durableFunctionsLogController.addDurableFunctionLog({
    type: 'NUMBER_GENERATOR',
    data: {
      instanceId,
      dealType,
      entityType,
      entityId,
      dealId,
      numberGeneratorFunctionUrls,
      user,
    },
  });

  return response;
};

exports.callNumberGeneratorPOST = async (req, res) => {
  const {
    dealType, entityType, entityId, dealId, user,
  } = req.body;

  const { status } = await callNumberGenerator({
    dealType, entityType, entityId, dealId, user,
  });

  return res.status(status).send({ ukefId: 'PENDING' });
};


// const callNumberGeneratorApi = async (numberType) => {
//   console.log('Calling Number Generator API');
//   const response = await axios({
//     method: 'post',
//     url: process.env.MULESOFT_API_NUMBER_GENERATOR_URL,
//     auth: {
//       username: process.env.MULESOFT_API_KEY,
//       password: process.env.MULESOFT_API_SECRET,
//     },
//     data: [
//       {
//         numberTypeId: numberType,
//         createdBy: 'Portal v2/TFM',
//         requestingSystem: 'Portal v2/TFM',
//       },
//     ],
//   }).catch((catchErr) => {
//     console.log('Number Generator Error', { catchErr });
//     return {
//       data: {
//         maskedId: 'NUM_GEN_ERROR',
//       },
//     };
//   });

//   const { maskedId: id } = response.data;

//   return id;
// };

// const checkId = async (entityType, id) => {
//   if (entityType === CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL) {
//     const dealIdStatus = await checkDealId(id);
//     console.log(`Checked dealId ${id} with ACBS API: ${dealIdStatus}`);
//     return dealIdStatus;
//   }

//   if (entityType === CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY) {
//     const facilityIdStatus = await checkFacilityId(id);
//     console.log(`Checked facilityId ${id} with ACBS API: ${facilityIdStatus}`);
//     return facilityIdStatus;
//   }

//   return null;
// };

// exports.create = async (req, res) => {
//   const { entityType } = req.params;

//   console.log(`Creating UKEF ID for ${entityType}`);

//   let numberType;

//   if (entityType === CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL
//     || entityType === CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY) {
//     numberType = 1;
//   }

//   if (!numberTypeIsValid(numberType)) {
//     const message = `must be ${CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL}
//        or ${CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY}`;
//     return res.status(400).send(`Invalid entity type - ${message}`);
//   }

//   const createAndValidateId = () => new Promise((resolve) => {
//     let numberGeneratorId;
//     let completed = true;
//     let pending = false;
//     let totalCalls = 0;

//     const interval = setInterval(async () => {
//       totalCalls += 1;
//       if (totalCalls === 1) {
//         completed = false;
//       }

//       if (!pending && !completed && !numberGeneratorId) {
//         pending = true;
//         numberGeneratorId = await callNumberGeneratorApi(numberType);

//         const statusCode = await checkId(entityType, numberGeneratorId);

//         if (statusCode === 404) {
//           // deal id is not being used, so we can use it.
//           completed = true;
//           clearInterval(interval);
//           return resolve(numberGeneratorId);
//         }

//         // wipe the state so that API's are called again.
//         pending = false;
//         completed = false;
//         numberGeneratorId = null;
//         return numberGeneratorId;
//       }

//       return null;
//     }, 10);
//   });

//   const validId = await createAndValidateId();

//   return res.status(200).send({
//     id: validId,
//   });
// };
