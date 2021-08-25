// Number Generator API is used to get a new deal/facility id.
// However, the id might already be in use so we need to check it with ACBS.
//
// the flow is:
// 1) Call number generator Aure function
// 2) return a PENDING status while Azure function runs indepentantly
// 3) Create a scheduled job to keep checking the Azure function status


const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

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
    await durableFunctionsLogController.addDurableFunctionLog({
      type: 'NUMBER_GENERATOR',
      data: {
        dealType,
        entityType,
        entityId,
        dealId,
        user,
        error: await response.err.toJSON(),
      },
    });

    return {
      status: 500,
    };
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

  // Azure function returns 202 status but 200 is more relevant here as we're returning data
  const returnStatus = status === 202 ? 200 : status;
  return res.status(returnStatus).send({ ukefId: 'PENDING' });
};
