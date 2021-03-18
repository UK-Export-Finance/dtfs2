import _isEmpty from 'lodash/isEmpty';
import * as api from '../../services/api';
import { validationErrorHandler, selectDropdownAddresses } from '../../utils/helpers';

const exportersAddress = async (req, res) => {
  try {
    const { params, session } = req;
    const { applicationId } = params;
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { registeredAddress } = details;
    const { postcode, postcodeError, addresses } = session;

    req.session.postcode = null;
    req.session.postcodeError = null;
    req.session.addresses = null;

    return res.render('partials/exporters-address.njk', {
      errors: validationErrorHandler(postcodeError),
      companyName: details.companyName,
      correspondence: (postcodeError || addresses) ? 'true' : null,
      addressesForSelection: selectDropdownAddresses(addresses),
      addresses,
      registeredAddress,
      applicationId,
      postcode,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateExportersAddress = async (req, res) => {
  try {
    const { params, body } = req;
    const {
      correspondence, postcode, selectedAddress, addresses, addressesForSelection, addressLine1,
    } = body;
    const { applicationId } = params;
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { registeredAddress } = details;
    let correspondenceError;
    let selectedAddressError;
    let addressLine1Error;

    if (_isEmpty(correspondence)) {
      correspondenceError = {
        errRef: 'correspondence',
        errMsg: 'Select whether there’s a separate correspondence address for the exporter',
      };
    }

    // User has selected No so take them to about exporters page
    if (correspondence === 'false') {
      return res.redirect('about-exporter');
    }

    if (correspondence === 'true' && _isEmpty(postcode)) {
      correspondenceError = {
        errRef: 'postcode',
        errMsg: 'Enter a postcode',
      };
    }

    if (_isEmpty(selectedAddress)) {
      selectedAddressError = {
        errRef: 'selectedAddress',
        errMsg: 'Select an address',
      };
    }

    if (_isEmpty(addressLine1)) {
      addressLine1Error = {
        errRef: 'addressLine1',
        errMsg: 'Enter the first line of the correspondence address',
      };
    }

    const selectedAddressIndex = parseFloat(selectedAddress);
    const addressesForSelectionWithSelection = JSON.parse(addressesForSelection).map((address) => {
      if (address.value === selectedAddressIndex) {
        return {
          ...address,
          selected: true,
        };
      }
      return address;
    });

    return res.render('partials/exporters-address.njk', {
      errors: validationErrorHandler(correspondenceError || selectedAddressError || addressLine1Error),
      companyName: details.companyName,
      addressesForSelection: addressesForSelectionWithSelection,
      addresses: JSON.parse(addresses),
      addressForm: JSON.parse(addresses)[selectedAddressIndex],
      showForm: selectedAddressIndex >= 0,
      registeredAddress,
      applicationId,
      correspondence,
      postcode,
    });

    // return res.redirect('exporters-address');
  } catch (err) {
    // Validation errors
    if (err.status === 422) {
      return res.render('partials/companies-house.njk', {
        errors: validationErrorHandler(err.data),
      });
    }

    return res.render('partials/problem-with-service.njk');
  }
};

const postcodeSearch = async (req, res) => {
  const { params, body } = req;
  const { postcode } = body;
  const { applicationId } = params;

  if (_isEmpty(postcode)) {
    req.session.postcodeError = {
      errRef: 'postcode',
      errMsg: 'Enter a postcode',
    };
    return res.redirect(`/gef/application-details/${applicationId}/exporters-address`);
  }

  try {
    const addresses = await api.getAddressesByPostcode(postcode);

    req.session.addresses = addresses;
    req.session.postcode = postcode;

    return res.redirect(`/gef/application-details/${applicationId}/exporters-address`);
  } catch (err) {
    if (err.status === 422) {
      req.session.postcodeError = err.data;
      req.session.postcode = postcode;
      return res.redirect(`/gef/application-details/${applicationId}/exporters-address`);
    }
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  exportersAddress,
  validateExportersAddress,
  postcodeSearch,
};
