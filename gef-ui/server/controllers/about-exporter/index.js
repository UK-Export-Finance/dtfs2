import * as api from '../../services/api';

const aboutExporter = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;

  try {
    await api.getApplication(applicationId); // Makes sure application exists

    return res.render('partials/about-exporter.njk', {
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  aboutExporter,
};
