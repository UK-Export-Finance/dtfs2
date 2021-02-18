const nameApplication = async (req, res) => res.render('partials/name-application.njk');

const createApplication = async (req, res) => {
  const { body } = req;
  const { bankInternalRefName, additionalRefName } = body;

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
};

export {
  nameApplication,
  createApplication,
};
