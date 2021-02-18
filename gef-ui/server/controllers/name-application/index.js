const nameApplication = async (req, res) => res.render('partials/name-application.njk');

const createApplication = async (req, res) => {
  const { body } = req;
  const { banksInternalRef, banksAdditionalRef } = body;

  if (!banksInternalRef) {
    return res.render('partials/name-application.njk', {
      errors: {
        errorSummary: [
          {
            text: 'You must enter a bank reference or name',
            href: 'name-applicatione#banksInternalRef',
          },
        ],
        fieldErrors: {
          confirm: {
            text: 'Select an option',
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
