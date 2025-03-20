/**
 * Get a deal ID from the URL
 * @param {number} splitIndex - The index of the URL segment containing the deal ID after splitting the URL by '/'
 * @returns {string} The deal ID extracted from the URL
 */
const getDealIdFromUrl = (splitIndex) => {
  cy.url().then((url) => {
    const urlSplit = url.split('/');

    const dealId = urlSplit[splitIndex];

    return dealId;
  });
};

export default getDealIdFromUrl;
