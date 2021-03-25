import * as api from '../../services/api';
import { validationErrorHandler, isTrueSet } from '../../utils/helpers';

const aboutExporter = async (req, res) => {
  const { params, query } = req;
  const { applicationId } = params;
  const { status } = query;

  try {
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);

    return res.render('partials/about-exporter.njk', {
      industries: details.industries,
      smeType: details.smeType,
      probabilityOfDefault: details.probabilityOfDefault,
      isFinanceIncreasing: details.isFinanceIncreasing ? details.isFinanceIncreasing.toString() : null,
      applicationId,
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

  // Don't validate form if user clicks on 'return to application` button
  if (!saveAndReturn) {
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
        errMsg: 'Enter theSelect whether your financing to the exporter is increasing as a result of this new GEF facility ',
      });
    }
  }

  try {
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);

    if (aboutExporterErrors.length > 0) {
      return res.render('partials/about-exporter.njk', {
        errors: validationErrorHandler(aboutExporterErrors),
        industries: details.industries || null,
        smeType: body.smeType || null,
        probabilityOfDefault: body.probabilityOfDefault || null,
        isFinanceIncreasing: body.isFinanceIncreasing,
        applicationId,
      });
    }

    await api.updateExporter(exporterId, {
      ...body,
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
