
import _isEmpty from 'lodash/isEmpty';
import { selectDropdownAddresses, validationErrorHandler } from '../../utils/helpers';

const selectExportersCorrespondenceAddress = (req, res) => {
  const { params, session } = req;
  const { applicationId } = params;
  const { postcode, addresses } = session;
  const parseAddresses = JSON.parse(addresses);

  return res.render('partials/select-exporters-correspondence-address.njk', {
    addressesForSelection: selectDropdownAddresses(parseAddresses),
    postcode,
    applicationId,
  });
};

const validateSelectExportersCorrespondenceAddress = (req, res) => {
  const { params, body, session } = req;
  const { postcode, addresses } = session;
  const { selectedAddress } = body;
  const { applicationId } = params;
  const parseAddresses = JSON.parse(addresses);
  let selectedAddressError;

  if (_isEmpty(selectedAddress)) {
    selectedAddressError = {
      errRef: 'selectedAddress',
      errMsg: 'Select an address',
    };

    return res.render('partials/select-exporters-correspondence-address.njk', {
      errors: validationErrorHandler(selectedAddressError),
      addressesForSelection: selectDropdownAddresses(parseAddresses),
      postcode,
      applicationId,
    });
  }

  req.session.address = JSON.stringify(parseAddresses[parseFloat(selectedAddress)]);

  return res.redirect(`/gef/application-details/${applicationId}/enter-exporters-correspondence-address`);
};

export {
  selectExportersCorrespondenceAddress,
  validateSelectExportersCorrespondenceAddress,
};
