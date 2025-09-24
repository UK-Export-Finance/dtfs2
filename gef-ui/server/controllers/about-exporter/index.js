const api = require('../../services/api');
const { validationErrorHandler, isTrueSet } = require('../../utils/helpers');

const mappedIndustries = (industries, selectedIndustry) => {
  if (!industries) {
    return null;
  }
  return industries.map((industry) => ({
    value: JSON.stringify(industry),
    html: `${industry.name}<br />${industry.class.name}`,
    checked: selectedIndustry ? JSON.stringify(industry) === selectedIndustry : null,
  }));
};

/**
 * Controller to render the about exporter page.
 * @async
 * @function aboutExporter
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Renders the about-exporter page or an error page.
 */
const aboutExporter = async (req, res) => {
  const { params, query } = req;
  const { userToken } = req.session;
  const { dealId } = params;
  const { status } = query;

  try {
    const { exporter } = await api.getApplication({ dealId, userToken });
    const industries = mappedIndustries(exporter.industries, JSON.stringify(exporter.selectedIndustry));
    const isFinanceIncreasing = JSON.stringify(exporter.isFinanceIncreasing);
    const probabilityOfDefault = Number(exporter.probabilityOfDefault);

    return res.render('partials/about-exporter.njk', {
      dealId,
      smeType: exporter?.smeType,
      isFinanceIncreasing,
      probabilityOfDefault,
      selectedIndustry: exporter.selectedIndustry,
      industries,
      status,
    });
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * Validates and updates the about exporter form.
 * @async
 * @function validateAboutExporter
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Renders the about-exporter page with errors, or redirects on success.
 */
const validateAboutExporter = async (req, res) => {
  const { body, params, query, session } = req;
  const { dealId } = params;
  const { user, userToken } = session;
  const aboutExporterErrors = [];
  const { saveAndReturn, status } = query;
  const { _id: editorId } = user;

  try {
    const { exporter } = await api.getApplication({ dealId, userToken });

    // Only validate industries if it contains more than 1 SIC code
    if (!saveAndReturn && !body.selectedIndustry && exporter?.industries?.length > 1) {
      aboutExporterErrors.push({
        errRef: 'selectedIndustry',
        errMsg: 'Select most appropriate industry',
      });
    }

    if (!saveAndReturn && !body.smeType) {
      aboutExporterErrors.push({
        errRef: 'smeType',
        errMsg: 'Select type of small to medium enterprise (SME)',
      });
    }

    const minPercentage = 0;
    const maxPercentage = 14.1;
    const probabilityOfDefault = Number(body.probabilityOfDefault);

    if (!saveAndReturn && !body.probabilityOfDefault) {
      aboutExporterErrors.push({
        errRef: 'probabilityOfDefault',
        errMsg: 'Enter the probability of default',
      });
    } else if (
      body.probabilityOfDefault &&
      (Number.isNaN(probabilityOfDefault) || probabilityOfDefault >= maxPercentage || probabilityOfDefault <= minPercentage)
    ) {
      aboutExporterErrors.push({
        errRef: 'probabilityOfDefault',
        errMsg: `You must enter a percentage between ${minPercentage + 0.01}% to ${maxPercentage - 0.01}%`,
      });
    }

    if (!saveAndReturn && !body.isFinanceIncreasing) {
      aboutExporterErrors.push({
        errRef: 'isFinanceIncreasing',
        errMsg: 'Select whether your financing to the exporter is increasing as a result of this new GEF facility ',
      });
    }

    const industries = mappedIndustries(exporter.industries, body.selectedIndustry || exporter.selectedIndustry);

    if (aboutExporterErrors.length > 0) {
      return res.render('partials/about-exporter.njk', {
        errors: validationErrorHandler(aboutExporterErrors),
        smeType: body.smeType,
        probabilityOfDefault: Number(body.probabilityOfDefault),
        isFinanceIncreasing: body.isFinanceIncreasing,
        selectedIndustry: exporter.selectedIndustry,
        dealId,
        industries,
        status,
      });
    }

    const applicationExporterUpdate = {
      exporter: {
        ...exporter,
        smeType: body.smeType,
        selectedIndustry: body.selectedIndustry ? JSON.parse(body.selectedIndustry) : exporter.selectedIndustry,
        probabilityOfDefault: Number(body.probabilityOfDefault),
        isFinanceIncreasing: isTrueSet(body.isFinanceIncreasing),
      },
      editorId,
    };

    await api.updateApplication({ dealId, application: applicationExporterUpdate, userToken });

    return res.redirect(`/gef/application-details/${dealId}`);
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  mappedIndustries,
  aboutExporter,
  validateAboutExporter,
};
