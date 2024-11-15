const api = require('../../services/api');
const { validationErrorHandler } = require('../../utils/helpers');

const companiesHouse = async (req, res) => {
  const { params, query, session } = req;
  const { dealId } = params;
  const { status } = query;
  const { userToken } = session;

  try {
    const { exporter } = await api.getApplication({ dealId, userToken });
    const { companiesHouseRegistrationNumber } = exporter;

    return res.render('_partials/companies-house.njk', {
      regNumber: companiesHouseRegistrationNumber,
      dealId,
      status,
    });
  } catch (error) {
    console.error('GEF-UI - Error getting companies house page %o', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

const validateCompaniesHouse = async (req, res) => {
  try {
    const { params, body, query, session } = req;
    const { regNumber: registrationNumber } = body;
    const { dealId } = params;
    const { status } = query;
    const { user, userToken } = session;
    const { _id: editorId } = user;

    const { company: companiesHouseDetails, errRef, errMsg } = await api.getCompanyByRegistrationNumber({ registrationNumber, userToken });

    if (!companiesHouseDetails) {
      return res.render('_partials/companies-house.njk', {
        errors: validationErrorHandler([{ errRef, errMsg }]),
        regNumber: registrationNumber,
        dealId,
        status,
      });
    }

    const { exporter } = await api.getApplication({ dealId, userToken });

    // no errors so we can safely update the application.
    /**
     * added smeType, probabilityOfDefault, isFinanceIncreasing as blank strings
     * enables to be added to database so shows on application-details page if not exited without saving
     */

    companiesHouseDetails.selectedIndustry = companiesHouseDetails.industries?.length === 1 ? companiesHouseDetails.industries[0] : null;

    const applicationExporterUpdate = {
      exporter: {
        ...exporter,
        ...companiesHouseDetails,
        correspondenceAddress: null,
        smeType: '',
        probabilityOfDefault: '',
        isFinanceIncreasing: null,
      },
      editorId,
    };

    await api.updateApplication({ dealId, application: applicationExporterUpdate, userToken });

    if (status === 'change') {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    return res.redirect('exporters-address');
  } catch (error) {
    console.error('GEF-UI - Error validating companies house page %o', error);
    return res.render('_partials/problem-with-service.njk');
  }
};

module.exports = {
  companiesHouse,
  validateCompaniesHouse,
};
