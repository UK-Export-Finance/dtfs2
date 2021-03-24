
import _isEmpty from 'lodash/isEmpty';
import * as api from '../../services/api';
import { selectDropdownAddresses, validationErrorHandler } from '../../utils/helpers';

const selectExportersCorrespondenceAddress = async (req, res) => {
  const { params, session } = req;
  const { applicationId } = params;
  const { postcode, addresses } = session;

  try {
    await api.getApplication(applicationId); // We fetch application to make sure it exists
    return res.render('partials/select-exporters-correspondence-address.njk', {
      addressesForSelection: selectDropdownAddresses(JSON.parse(addresses)),
      postcode,
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
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
