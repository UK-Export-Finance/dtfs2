const { isValidRegex } = require('../../validation/validateIds');
const { UK_POSTCODE } = require('../../../constants/regex');

require('dotenv').config();
const externalApi = require('../../../external-api/api');

exports.getAddressesByPostcode = async (req, res) => {
  try {
    const { postcode } = req.params;

    if (!isValidRegex(UK_POSTCODE, postcode)) {
      console.error('Get addresses by postcode failed for postcode %s', postcode);
      return res.status(axios.HttpStatusCode.BadRequest).send([
        {
          status: axios.HttpStatusCode.BadRequest,
          errCode: 'ERROR',
          errRef: 'postcode',
          errMsg: 'Invalid postcode',
        },
      ]);
    }

    const response = await externalApi.geospatialAddresses.getAddressesByPostcode(postcode);

    if (response.status !== axios.HttpStatusCode.Ok) {
      return res.status(axios.HttpStatusCode.UnprocessableEntity).send([
        {
          status: axios.HttpStatusCode.UnprocessableEntity,
          errCode: 'ERROR',

          errRef: 'postcode',
        },
      ]);
    }

    return res.status(axios.HttpStatusCode.Ok).send(response.data);
  } catch (error) {
    let { status } = error.response;
    if (status >= 400 && status < 500) {
      status = axios.HttpStatusCode.UnprocessableEntity;
    }
    const response = [
      {
        status,
        errCode: 'ERROR',
        errRef: 'postcode',
        errMsg: error?.response?.data?.error?.message || {},
      },
    ];
    return res.status(status).send(response);
  }
};
