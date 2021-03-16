const axios = require('axios');
const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
// const { companiesHouseError } = require('./validation/external');
require('dotenv').config();

const referenceProxyUrl = process.env.REFERENCE_DATA_PROXY_URL;

const collectionName = 'gef-exporter';

exports.getByRegistrationNumber = async (req, res) => {
  const collection = await db.getCollection(collectionName);
  try {
    const companyNumber = req.params.number;
    if (!companyNumber || companyNumber === '') {
      res.status(422).send();
    }
    const response = await axios({
      method: 'get',
      url: `${referenceProxyUrl}/companies-house/${companyNumber}`,
    });
    console.log(`${referenceProxyUrl}/companies-house/${companyNumber}`, response);
    if (req.query.exporterId) {
      await collection.findOneAndUpdate(
        { _id: { $eq: ObjectId(String(req.query.exporterId)) } }, {
          $set: {
            companiesHouseRegistrationNumber: response.data.company_number,
            companyName: response.data.company_name,
            registeredAddress: response.data.registered_office_address,
          },
        }, { returnOriginal: false },
      );
    }
    res.status(200).send(response.data);
  } catch (err) {
    console.log(err);
    // const response = companiesHouseError(err);
    // res.status(err.response.status).send(); // response
    res.status(500).send();
  }
};

exports.getAddressesByPostcode = async (req, res) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${referenceProxyUrl}/ordnance-survey/${req.params.postcode}`,
    });
    const addresses = [];
    response.data.results.forEach((item) => {
      addresses.push({
        organisation_name: item.DPA.ORGANISATION_NAME ? item.DPA.ORGANISATION_NAME : null,
        address_line_1: `${item.DPA.BUILDING_NAME ? item.DPA.BUILDING_NAME : ''} ${item.DPA.BUILDING_NUMBER ? item.DPA.BUILDING_NUMBER : ''} ${item.DPA.THOROUGHFARE_NAME}`,
        address_line_2: item.DPA.DEPENDENT_LOCALITY ? item.DPA.DEPENDENT_LOCALITY : null,
        locality: item.DPA.POST_TOWN ? item.DPA.POST_TOWN : null,
        postal_code: item.DPA.POSTCODE ? item.DPA.POSTCODE : null,
      });
    });
    res.status(200).send(addresses);
  } catch (err) {
    const response = {
      errCode: 'ERROR',
      errRef: 'postcode',
      errMsg: err.response.data.error.message,
    };
    res.status(err.response.status).send(response);
  }
};
