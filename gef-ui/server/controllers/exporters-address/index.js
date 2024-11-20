const api = require('../../services/api');
const { validationErrorHandler, isTrueSet, isEmpty } = require('../../utils/helpers');

const exportersAddress = async (req, res) => {
  try {
    const { params } = req;
    const { dealId } = params;
    const { userToken } = req.session;

    const { exporter } = await api.getApplication({ dealId, userToken });
    const { companyName, registeredAddress } = exporter;

    return res.render('partials/exporters-address.njk', {
      companyName,
      registeredAddress,
      dealId,
    });
  } catch (error) {
    console.error('GEF-UI - Error getting exporters address page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

const validateExportersAddress = async (req, res) => {
  try {
    const { params, body } = req;
    const { correspondence, postcode } = body;
    const { dealId } = params;
    const { userToken } = req.session;

    const { exporter } = await api.getApplication({ dealId, userToken });
    const { companyName = '' } = exporter;

    const correspondenceError = [];
    let addresses;

    if (!correspondence) {
      correspondenceError.push({
        errRef: 'correspondence',
        errMsg: 'Select whether there’s a separate correspondence address for the exporter',
      });
    }

    // User has selected No, take them to about exporters page
    if (correspondence === 'false') {
      return res.redirect('about-exporter');
    }

    if (isTrueSet(correspondence) && isEmpty(postcode)) {
      correspondenceError.push({
        errRef: 'postcode',
        errMsg: 'Enter a postcode',
      });
    }

    // Only fetch addresses if there are no validation errors
    if (correspondenceError.length === 0) {
      try {
        addresses = await api.getAddressesByPostcode({ postcode, userToken });
      } catch (error) {
        correspondenceError.push({
          errRef: 'postcode',
          errMsg: 'Error looking up postcode. Try again.',
        });
      }
    }

    // Check for validation errors
    if (addresses?.status === 422 || addresses?.status === 400) {
      addresses.data.forEach((error) => {
        correspondenceError.push(error);
      });
    }

    if (correspondenceError.length > 0) {
      return res.render('partials/exporters-address.njk', {
        errors: validationErrorHandler(correspondenceError),
        companyName,
        postcode: postcode ? postcode.toUpperCase() : '',
        correspondence,
        dealId,
      });
    }

    // Store addresses to session memory
    // Stringifying for better compression
    req.session.postcode = postcode.toUpperCase();
    req.session.addresses = JSON.stringify(addresses);

    return res.redirect('select-exporters-correspondence-address');
  } catch (error) {
    console.error('GEF-UI - Error validating exporters address page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  exportersAddress,
  validateExportersAddress,
};
