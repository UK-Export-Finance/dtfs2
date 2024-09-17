import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import activitiesPage from '../../../pages/activities/activitiesPage';
import activityCommentBoxPage from '../../../pages/activities/activityCommentBoxPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { BUSINESS_SUPPORT_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';

import { todayFormatted } from '../../../../../../e2e-fixtures/dateConstants';

context('Users can create and submit comments', () => {
  let dealId;
  const dealFacilities = [];
  const userFullName = `${BUSINESS_SUPPORT_USER_1.firstName} ${BUSINESS_SUPPORT_USER_1.lastName}`;

  before(() => {
    cy.getUser(BUSINESS_SUPPORT_USER_1.username, BUSINESS_SUPPORT_USER_1);

    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, BUSINESS_SUPPORT_USER_1);
      // adds a non-comment type
      const otherActivity = {
        tfm: {
          activities: {
            type: 'OTHER',
            timestamp: 13345665,
            text: 'Not a comment',
            author: {
              firstName: 'tester',
              lastName: 'smith',
              _id: 12243343242342,
            },
            label: 'Other',
          },
        },
      };
      cy.updateTFMDeal(dealId, otherActivity);
      cy.login(BUSINESS_SUPPORT_USER_1);
    });
  });

  beforeEach(() => {
    cy.saveSession();
    cy.visit(relative(`/case/${dealId}/activity`));
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  describe('add a comment', () => {
    it('should show correct heading and aria-label for activities tab heading', () => {
      activitiesPage.mainHeading().contains('Activity and comments');
    });

    it('should go to add a comment page if add comment button clicked', () => {
      activitiesPage.addACommentButton().click();
      cy.url().should('eq', relative(`/case/${dealId}/activity/post-comment`));
      activitiesPage.addACommentHeading().contains('Add a comment');
      activitiesPage
        .addACommentHeading()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal('Add a comment');
        });
    });

    it('entering no comment should take you back to activity page and no comment in timeline', () => {
      activitiesPage.addACommentButton().click();
      activityCommentBoxPage.addCommentButton().click();
      activitiesPage.activitiesTimeline().contains(userFullName).should('not.exist');
    });

    it('should submit a comment under 1000 characters and render date of comment', () => {
      activitiesPage.addACommentButton().click();
      activityCommentBoxPage.activityCommentBox().type('test');
      activityCommentBoxPage.addCommentButton().click();

      activitiesPage.activitiesTimeline().contains('test');
      activitiesPage.activitiesTimeline().contains(userFullName);

      const expectedDate = todayFormatted;

      activitiesPage.activitiesTimeline().contains(expectedDate);
    });

    it('pressing cancel should not submit a comment', () => {
      activitiesPage.addACommentButton().click();
      activityCommentBoxPage.activityCommentBox().type('should cancel');
      cy.clickCancelLink();
      activitiesPage.activitiesTimeline().contains('should cancel').should('not.exist');
    });

    it('pressing comment filter should show comments', () => {
      activitiesPage.activitiesTimeline().contains('Not a comment');
      activitiesPage.filterCommentsOnly().click();
      cy.clickSubmitButton();
      activitiesPage.activitiesTimeline().contains('test');
      activitiesPage.activitiesTimeline().contains(userFullName);
      // ensures that is filtered out
      activitiesPage.activitiesTimeline().contains('Not a comment').should('not.exist');
    });

    it('should not be allowed to add comment over 1000 characters', () => {
      const longComment = 'aaaaaaaaaa'.repeat(101);
      activitiesPage.addACommentButton().click();
      activityCommentBoxPage.activityCommentBox().typeWithoutDelay(longComment);
      activityCommentBoxPage.addCommentButton().click();
      errorSummary().contains('Comments must be 1000 characters or fewer');
      activityCommentBoxPage.commentErrorMessage().contains('Comments must be 1000 characters or fewer');
    });
  });
});
