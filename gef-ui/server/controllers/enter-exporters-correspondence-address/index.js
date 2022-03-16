const api = require('../../services/api');
const { validationErrorHandler, isTrueSet } = require('../../utils/helpers');
const { DEFAULT_COUNTRY } = require('../../constants');

const enterExportersCorrespondenceAddress = async (req, res) => {
  const { params, session, query } = req;
  const { dealId } = params;
  const { address } = session;
  const parseAddress = address ? JSON.parse(address) : null;
  const { status } = query;
  const backUrl = `/gef/application-details/${dealId}`;

  try {
    const { exporter } = await api.getApplication(dealId);
    const { correspondenceAddress } = exporter;

    let mappedAddress;

    if (parseAddress) {
      mappedAddress = {
        organisationName: parseAddress.organisation_name,
        addressLine1: parseAddress.addressLine1,
        addressLine2: parseAddress.addressLine2,
        addressLine3: parseAddress.addressLine3,
        locality: parseAddress.locality,
        postalCode: parseAddress.postalCode,
      };
    }

    let addressForm = {};
    if (mappedAddress) {
      addressForm = mappedAddress;
    }

    if (correspondenceAddress) {
      addressForm = correspondenceAddress;
    }

    return res.render('partials/enter-exporters-correspondence-address.njk', {
      addressForm,
      dealId,
      status,
      backUrl,
    });
  } catch (err) {
    console.error(err);
    return res.render('partials/problem-with-service.njk');
  }
};

const validateEnterExportersCorrespondenceAddress = async (req, res) => {
  const {
    params, body, query, session,
  } = req;
  const { saveAndReturn, status } = query;
  const { dealId } = params;
  const { user } = session;
  const { _id } = user;

  const addressErrors = [];

  if (!isTrueSet(saveAndReturn)) {
    if (!body.addressLine1) {
      addressErrors.push({
        errRef: 'addressLine1',
        errMsg: 'Enter address',
      });
    }

    if (!body.postalCode) {
      addressErrors.push({
        errRef: 'postalCode',
        errMsg: 'Enter postcode',
      });
    }

    if (addressErrors.length > 0) {
      return res.render('partials/enter-exporters-correspondence-address.njk', {
        errors: validationErrorHandler(addressErrors),
        addressForm: body,
        dealId,
      });
    }
  }

  // always default to UK (this is not entered in the UI)
  // https://ukef-dtfs.atlassian.net/browse/DTFS2-4456?focusedCommentId=15031
  body.country = DEFAULT_COUNTRY;

  try {
    const { exporter } = await api.getApplication(dealId);

    const applicationExporterUpdate = {
      exporter: {
        ...exporter,
        correspondenceAddress: body,
      },
      editorId: _id,
    };

    await api.updateApplication(dealId, applicationExporterUpdate);

    req.session.address = null;
    if (isTrueSet(saveAndReturn) || status === 'change') {
      return res.redirect(`/gef/application-details/${dealId}`);
    }
    return res.redirect(`/gef/application-details/${dealId}/about-exporter`);
  } catch (err) {
    console.error(err);
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  enterExportersCorrespondenceAddress,
  validateEnterExportersCorrespondenceAddress,
};
