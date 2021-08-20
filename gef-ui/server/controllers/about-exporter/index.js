import * as api from '../../services/api';
import { validationErrorHandler, isTrueSet } from '../../utils/helpers';

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
  const { applicationId } = params;
  const { status } = query;

  try {
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);
    const industries = mappedIndustries(details.industries, JSON.stringify(details.selectedIndustry));
    const isFinanceIncreasing = JSON.stringify(details.isFinanceIncreasing);
    const probabilityOfDefault = JSON.stringify(details.probabilityOfDefault);

    return res.render('partials/about-exporter.njk', {
      smeType: details.smeType,
      probabilityOfDefault: probabilityOfDefault !== 'null' ? probabilityOfDefault : null,
      isFinanceIncreasing: isFinanceIncreasing !== 'null' ? isFinanceIncreasing : null,
      selectedIndustry: details.selectedIndustry,
      applicationId,
      industries,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateAboutExporter = async (req, res) => {
  const { body, params, query } = req;
  const { applicationId } = params;
  const aboutExporterErrors = [];
  const { saveAndReturn, status } = query;

  try {
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);

    // Only validate industries if it contains more than 1 SIC code
    if (!saveAndReturn && !body.selectedIndustry && (details.industries && details.industries.length > 1)) {
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

    const industries = mappedIndustries(details.industries, (body.selectedIndustry || details.selectedIndustry));

    if (aboutExporterErrors.length > 0) {
      return res.render('partials/about-exporter.njk', {
        errors: validationErrorHandler(aboutExporterErrors),
        smeType: body.smeType,
        probabilityOfDefault: body.probabilityOfDefault,
        isFinanceIncreasing: body.isFinanceIncreasing,
        selectedIndustry: details.selectedIndustry,
        applicationId,
        industries,
        status,
      });
    }

    await api.updateExporter(exporterId, {
      ...body,
      selectedIndustry: body.selectedIndustry ? JSON.parse(body.selectedIndustry) : null,
      probabilityOfDefault: body.probabilityOfDefault || null,
      isFinanceIncreasing: isTrueSet(body.isFinanceIncreasing),
    });

    return res.redirect(`/gef/application-details/${applicationId}`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  aboutExporter,
  validateAboutExporter,
};
