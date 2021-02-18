import * as api from '../../services/api';

const nameApplication = async (req, res) => res.render('partials/name-application.njk');

const createApplication = async (req, res) => {
  const { body, session } = req;

  const { bankInternalRefName } = body;
  const { _id: userId } = session.user;

  if (!bankInternalRefName) {
    return res.render('partials/name-application.njk', {
      errors: {
        errorSummary: [
          {
            text: 'You must enter a bank reference or name',
            href: 'name-applicatione#bankInternalRefName',
          },
        ],
        fieldErrors: {
          bankInternalRefName: {
            text: 'You must enter a bank reference or name',
          },
        },
      },
    });
  }

  try {
    await api.createApplication({
      ...body,
      userId,
    });

    return res.redirect('application-details');
  } catch (err) {
    return res.render('partials/name-application.njk', {
      errors: err,
    });
  }
};

export {
  nameApplication,
  createApplication,
};
