/**
 * Get a facility ID from the URL
 */
export const getFacilityIdFromUrl = () => {
  cy.url().then((url) => {
    const urlSplit = url.split('/');

    const facilityId = urlSplit[7];

    return facilityId;
  });
};
