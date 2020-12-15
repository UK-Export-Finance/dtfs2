const axios = require('axios');
const CONSTANTS = require('../../constants');

// dev
// https://dev-ukef-tf-ea-v1.uk-e1.cloudhub.io/api/v1/numbers

// mocking
// https://anypoint.mulesoft.com/mocking/api/v1/links/f5b562e9-440d-4566-85fb-d9f9a999c440/numbers


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
    url: 'https://anypoint.mulesoft.com/mocking/api/v1/links/f5b562e9-440d-4566-85fb-d9f9a999c440/numbers',
    headers: {
      Authorization: 'mock test',
    },
    data:[
        {
          numberTypeId: numberType,
          createdBy: 'Portal v2/TFM',
          requestingSystem: 'Portal v2/TFM',
        }
      ]
  }).catch((catchErr) => catchErr);


  const { status, data } = response;

  return res.status(status).send({
    id: data.mdmNumberExample.value.maskedId
  });
};
