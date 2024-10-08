/**
 * Get a deal ID from the URL
 */
const getDealIdFromUrl = () => {
  cy.url().then((url) => {
    const urlSplit = url.split('/');

    const dealId = urlSplit[5];

    return dealId;
  });
};

export default getDealIdFromUrl;
