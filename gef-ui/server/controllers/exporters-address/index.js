import _isEmpty from 'lodash/isEmpty';
import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const exportersAddress = async (req, res) => {
  try {
    const { params } = req;
    const { applicationId } = params;
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { registeredAddress } = details;

    return res.render('partials/exporters-address.njk', {
      companyName: details.companyName,
      registeredAddress,
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateExportersAddress = async (req, res) => {
  try {
    const { params, body } = req;
    const { correspondence, postcode } = body;
    const { applicationId } = params;
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const { registeredAddress } = details;
    let correspondenceError;
    let addresses;

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

    // Only fetch addresses if there are no validation errors
    if (!correspondenceError) {
      addresses = await api.getAddressesByPostcode(postcode);
    }

    if (addresses && addresses.status === 422) {
      correspondenceError = addresses.data;
    }

    if (correspondenceError) {
      return res.render('partials/exporters-address.njk', {
        errors: validationErrorHandler(correspondenceError),
        companyName: details.companyName,
        postcode: postcode.toUpperCase(),
        registeredAddress,
        correspondence,
      });
    }

    // Store addresses to session memory
    // Stringifying for better compression
    req.session.postcode = postcode.toUpperCase();
    req.session.addresses = JSON.stringify(addresses);

    return res.redirect('select-exporters-correspondence-address');
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  exportersAddress,
  validateExportersAddress,
};
