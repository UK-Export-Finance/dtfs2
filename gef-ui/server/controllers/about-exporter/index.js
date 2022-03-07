const api = require('../../services/api');
const { validationErrorHandler, isTrueSet } = require('../../utils/helpers');

const mappedIndustries = (industries, selectedIndustry) => {
  if (!industries) { return null; }
  return industries.map((industry) => ({
    value: JSON.stringify(industry),
    html: `${industry.name}<br />${industry.class.name}`,
    checked: selectedIndustry ? JSON.stringify(industry) === selectedIndustry : null,
  }));
};

const aboutExporter = async (req, res) => {
  const { params, query } = req;
  const { dealId } = params;
  const { status } = query;

  try {
    const { exporter } = await api.getApplication(dealId);
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
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateAboutExporter = async (req, res) => {
  const { body, params, query } = req;
  const { dealId } = params;
  const aboutExporterErrors = [];
  const { saveAndReturn, status } = query;

  try {
    const { exporter } = await api.getApplication(dealId);

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
    } else if (body.probabilityOfDefault
    && (Number.isNaN(probabilityOfDefault)
    || probabilityOfDefault >= maxPercentage
    || probabilityOfDefault <= minPercentage)
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

    const industries = mappedIndustries(exporter.industries, (body.selectedIndustry || exporter.selectedIndustry));

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
        ...body,
        selectedIndustry: body.selectedIndustry ? JSON.parse(body.selectedIndustry) : exporter.selectedIndustry,
        probabilityOfDefault: Number(body.probabilityOfDefault),
        isFinanceIncreasing: isTrueSet(body.isFinanceIncreasing),
      },
    };

    await api.updateApplication(dealId, applicationExporterUpdate);

    return res.redirect(`/gef/application-details/${dealId}`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  mappedIndustries,
  aboutExporter,
  validateAboutExporter,
};
