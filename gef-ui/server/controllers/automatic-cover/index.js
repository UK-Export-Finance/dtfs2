import * as api from '../../services/api';

const automaticCover = async (req, res) => {
  try {
    const cover = await api.getAutomaticCover();

    return res.render('partials/mandatory-criteria.njk', {
      cover,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};


export {
  automaticCover,
};
