const { withContactUsEmailAddressTests } = require('../test-helpers/with-contact-us-email-address.component-tests');

const page = 'login/temporarily-suspended.njk';

describe(page, () => {
  withContactUsEmailAddressTests({ page });
});
