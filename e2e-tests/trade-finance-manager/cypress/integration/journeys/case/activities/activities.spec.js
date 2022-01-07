import relative from '../../../relativeURL';
import activitiesPage from '../../../pages/activities/activitiesPage';
import activityCommentBoxPage from '../../../pages/activities/activityCommentBoxPage';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import MOCK_USERS from '../../../../fixtures/users';
import { MOCK_MAKER_TFM, ADMIN_LOGIN } from '../../../../fixtures/users-portal';

const { format } = require('date-fns');

context('Users can create and submit comments', () => {
  let dealId;
  const dealFacilities = [];
  const businessSupportUser = MOCK_USERS.find((u) => u.teams.includes('BUSINESS_SUPPORT'));
  const userFullName = `${businessSupportUser.firstName} ${businessSupportUser.lastName}`;
  let userId;
  let loggedInUserTeamName;
  let usersInTeam;

  before(() => {
    cy.deleteDeals(MOCK_DEAL_AIN._id, ADMIN_LOGIN);

    cy.getUser(businessSupportUser.username).then((userObj) => {
      userId = userObj._id;
    });

    [loggedInUserTeamName] = businessSupportUser.teams;
    usersInTeam = MOCK_USERS.filter((u) => u.teams.includes(loggedInUserTeamName));
    cy.insertOneDeal(MOCK_DEAL_AIN, MOCK_MAKER_TFM)
      .then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType, mockFacilities } = MOCK_DEAL_AIN;

        cy.createFacilities(dealId, mockFacilities, MOCK_MAKER_TFM).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });

        cy.submitDeal(dealId, dealType);
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
        cy.login(businessSupportUser);
      });
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/case/${dealId}/activity`));
  });

  describe('add a comment', () => {
    it('should go to add a comment page if add comment button clicked', () => {
      activitiesPage.addACommentButton().click();
      cy.url().should('eq', relative(`/case/${dealId}/activity/post-comment`));
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

      const expectedDate = format(new Date(), 'd MMMM yyyy');

      activitiesPage.activitiesTimeline().contains(expectedDate);
    });

    it('pressing cancel should not submit a comment', () => {
      activitiesPage.addACommentButton().click();
      activityCommentBoxPage.activityCommentBox().type('should cancel');
      activityCommentBoxPage.cancelButton().click();
      activitiesPage.activitiesTimeline().contains('should cancel').should('not.exist');
    });

    it('pressing comment filter should show comments', () => {
      activitiesPage.activitiesTimeline().contains('Not a comment');
      activitiesPage.filterCommentsOnly().click();
      activitiesPage.activitiesTimeline().contains('test');
      activitiesPage.activitiesTimeline().contains(userFullName);
      // ensures that is filtered out
      activitiesPage.activitiesTimeline().contains('Not a comment').should('not.exist');
    });

    it('should not be allowed to add comment over 1000 characters', () => {
      const longComment = 'aaaaaaaaaa'.repeat(101);
      activitiesPage.addACommentButton().click();
      activityCommentBoxPage.activityCommentBox().type(longComment);
      activityCommentBoxPage.addCommentButton().click();
      activityCommentBoxPage.commentErrorSummary().contains('Comments must be 1000 characters or fewer');
      activityCommentBoxPage.commentErrorMessage().contains('Comments must be 1000 characters or fewer');
    });
  });
});
