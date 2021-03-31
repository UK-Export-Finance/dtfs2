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

    return res.render('partials/about-exporter.njk', {
      smeType: details.smeType,
      probabilityOfDefault: details.probabilityOfDefault,
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
  const { saveAndReturn } = query;

  try {
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);

    // Don't validate form if user clicks on 'return to application` button
    if (!saveAndReturn) {
      if (!body.selectedIndustry && (details.industries && details.industries.length > 0)) {
        aboutExporterErrors.push({
          errRef: 'selectedIndustry',
          errMsg: 'Select most appropriate industry',
        });
      }

      if (!body.smeType) {
        aboutExporterErrors.push({
          errRef: 'smeType',
          errMsg: 'Select type of small to medium enterprise (SME)',
        });
      }

      if (!body.probabilityOfDefault) {
        aboutExporterErrors.push({
          errRef: 'probabilityOfDefault',
          errMsg: 'Enter the probability of default',
        });
      }

      if (!body.isFinanceIncreasing) {
        aboutExporterErrors.push({
          errRef: 'isFinanceIncreasing',
          errMsg: 'Select whether your financing to the exporter is increasing as a result of this new GEF facility ',
        });
      }
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
