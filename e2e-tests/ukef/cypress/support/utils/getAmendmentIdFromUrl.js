/**
 * Extract the amendment ID from the current URL
 * @returns {string} The amendment ID
 */
export const getAmendmentIdFromUrl = () => {
  return cy.url().then((url) => {
    const urlSplit = url.split('/');
    return urlSplit[9];
  });
};
