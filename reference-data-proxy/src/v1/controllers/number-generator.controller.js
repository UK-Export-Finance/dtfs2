const axios = require('axios');
const CONSTANTS = require('../../constants');
const { checkDealId } = require('./acbs.controller');

const numberTypeIsValid = (numberType) => {
  if (!Object.values(CONSTANTS.NUMBER_GENERATOR).includes(numberType)) {
    return false;
  }

  return true;
};

const callNumberGenerator = async (numberType) => {
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
}

exports.create = async (req, res) => {
  const numberType = Number(req.params.numberType);

  if (!numberTypeIsValid(numberType)) {
    return res.status(400).send('Invalid number type.');
  }

  // const response = await axios({
  //   method: 'post',
  //   url: process.env.MULESOFT_API_NUMBER_GENERATOR_URL,
  //   auth: {
  //     username: process.env.MULESOFT_API_KEY,
  //     password: process.env.MULESOFT_API_SECRET,
  //   },
  //   data: [
  //     {
  //       numberTypeId: numberType,
  //       createdBy: 'Portal v2/TFM',
  //       requestingSystem: 'Portal v2/TFM',
  //     },
  //   ],
  // }).catch((catchErr) => catchErr);

  const { status, data } = await callNumberGenerator(numberType);
  
  const numberGeneratorId = data.maskedId;
  
  // TODO check with ACBS
  if (numberType === CONSTANTS.NUMBER_GENERATOR.DEAL) {
    const { status } = await checkDealId();

    if (status === 404) {
      // deal id is not being used 
      
    } else {
      // deal id is already in use so we need to get another one.
    }
  }

  // return res.status(status).send({
  //   id: data.maskedId,
  // });
};
