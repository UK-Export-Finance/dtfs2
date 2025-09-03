const { withContactUsEmailAddressTests } = require('./test-helpers/with-contact-us-email-address.component-tests');

const page = 'reset-password.njk';

describe(page, () => {
  withContactUsEmailAddressTests({ page });
});
