import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

const aboutExporter = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;

  try {
    const { exporterId } = await api.getApplication(applicationId);
    const { details } = await api.getExporter(exporterId);

    return res.render('partials/about-exporter.njk', {
      industries: details.industries,
      smeType: details.smeType,
      probabilityOfDefault: typeof details.probabilityOfDefault === 'number' ? details.probabilityOfDefault.toString() : null,
      isFinanceIncreasing: details.isFinanceIncreasing,
      applicationId,
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
  if (saveAndReturn !== 'true') {
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
    await api.updateExporter(exporterId, {
      ...body,
      isFinanceIncreasing: body.isFinanceIncreasing === 'true',
    });

    if (aboutExporterErrors.length > 0) {
      return res.render('partials/about-exporter.njk', {
        errors: validationErrorHandler(aboutExporterErrors),
        industries: details.industries,
        smeType: body.smeType,
        probabilityOfDefault: body.probabilityOfDefault,
        isFinanceIncreasing: body.isFinanceIncreasing,
        applicationId,
      });
    }

    return res.redirect(`/gef/application-details/${applicationId}`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  validateAboutExporter,
};
