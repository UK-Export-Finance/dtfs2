const axios = require('axios');
const CONSTANTS = require('../../constants');

const numberTypeIsValid = (numberType) => {
  if (!Object.values(CONSTANTS.NUMBER_GENERATOR).includes(numberType)) {
    return false;
  }

  return true;
};

exports.create = async (req, res) => {
  const numberType = Number(req.params.numberType);

  if (!numberTypeIsValid(numberType)) {
    return res.status(400).send('Invalid number type.');
  }

  const response = await axios({
    method: 'post',
    url: process.env.MULESOFT_API_NUMBER_GENERATOR,
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

  const { status, data } = response;

  return res.status(status).send({
    id: data.maskedId,
  });
};
