import './commands';

// Mitigates test fails due to js errors (third-party js)
Cypress.on('uncaught:exception', () => false);

// eslint-disable-next-line no-unused-vars
Cypress.on('fail', (err, _runnable) => {
  const pageBodyHtml = Cypress.$('body').html();

  // Print the page body HTML to the console as part of the error if a test fails
  // TODO DTFS2-6775: Remove this extra logging information when there are no more flakey e2e tests
  // to investigate.
  // eslint-disable-next-line no-param-reassign
  err.message += `\n\n[DEBUG] The HTML of the page body is: ${JSON.stringify(pageBodyHtml)}`;
  throw err;
});
