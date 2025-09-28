const { selectDropdownAddresses, validationErrorHandler, isEmpty } = require('../../utils/helpers');

const api = require('../../services/api');

/**
 * Controller to get the selection of an exporter's correspondence address.
 *
 * @async
 * @function selectExportersCorrespondenceAddress
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Renders a view based on the result of the operation.
 */
const selectExportersCorrespondenceAddress = async (req, res) => {
  const { params, session } = req;
  const { dealId } = params;
  const { postcode, addresses, userToken } = session;

  try {
    await api.getApplication({ dealId, userToken }); // We fetch application to make sure it exists
    return res.render('partials/select-exporters-correspondence-address.njk', {
      addressesForSelection: selectDropdownAddresses(JSON.parse(addresses)),
      postcode,
      dealId,
    });
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * Post the selected exporter correspondence address from the request body.
 *
 * @function validateSelectExportersCorrespondenceAddress
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {void}
 */
const validateSelectExportersCorrespondenceAddress = (req, res) => {
  const { params, body, session } = req;
  const { postcode, addresses } = session;
  const { selectedAddress } = body;
  const { dealId } = params;
  const parseAddresses = JSON.parse(addresses);
  let selectedAddressError;

  if (isEmpty(selectedAddress) || selectedAddress.includes('Addresses Found')) {
    selectedAddressError = {
      errRef: 'selectedAddress',
      errMsg: 'Select an address',
    };

    return res.render('partials/select-exporters-correspondence-address.njk', {
      errors: validationErrorHandler(selectedAddressError),
      addressesForSelection: selectDropdownAddresses(parseAddresses),
      postcode,
      dealId,
    });
  }

  req.session.address = JSON.stringify(parseAddresses[parseFloat(selectedAddress)]);

  return res.redirect(`/gef/application-details/${dealId}/enter-exporters-correspondence-address`);
};

module.exports = {
  selectExportersCorrespondenceAddress,
  validateSelectExportersCorrespondenceAddress,
};
