import { cloneGEFDeal } from '../../../e2e/pages/clone-deal';

/**
 * checkCloneDealLink
 * checks the clone deal link has the correct text and label
 * @param {string} dealName - name of the deal
 */
export const checkCloneDealLink = (dealName) => {
  cy.assertText(cloneGEFDeal.cloneGefDealLink(), 'Clone');
  cloneGEFDeal
    .cloneGefDealLink()
    .invoke('attr', 'aria-label')
    .then((label) => {
      expect(label).to.equal(`Clone deal ${dealName}`);
    });
};
