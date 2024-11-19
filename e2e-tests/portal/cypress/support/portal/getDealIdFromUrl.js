/**
 * Get a deal ID from the URL
 */
const getDealIdFromUrl = (splitIndex) => {
  cy.url().then((url) => {
    const urlSplit = url.split('/');

    const dealId = urlSplit[splitIndex];

    return dealId;
  });
};

export default getDealIdFromUrl;
