import { MOCK_DEAL_AIN, oneMonth, today, tomorrow } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../relativeURL';
import { caseSubNavigation, continueButton } from '../../../partials';
import facilityPage from '../../../pages/facilityPage';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import caseDealPage from '../../../pages/caseDealPage';
import { PIM_USER_1, UNDERWRITER_MANAGER_1, UNDERWRITER_MANAGER_DECISIONS, BANK1_MAKER1, ADMIN } from '../../../../../../e2e-fixtures';
import pages from '../../../pages';
import { NOT_ADDED } from '../../../../fixtures/constants';

context('Amendments underwriting - add banks decision - declined by underwriter', () => {
  const addAmendmentSelector = '[data-cy="amendment--add-amendment-button"]';
  const addUnderwriterManagerDecisionSelector = '[data-cy="add-amendment-underwriter-manager-decision-link"]';

  let dealId;
  const dealFacilities = [];

  const tfmApiBaseUrl = () => `${Cypress.config('tfmApiProtocol')}${Cypress.config('tfmApiHost')}:${Cypress.config('tfmApiPort')}`;

  const tfmApiHeaders = (token) => ({
    'x-api-key': Cypress.config('apiKey'),
    'Content-Type': 'application/json',
    ...(token ? { Authorization: token } : {}),
  });

  const getTfmApiToken = () =>
    cy
      .request({
        url: `${tfmApiBaseUrl()}/v1/login`,
        method: 'POST',
        body: {
          username: PIM_USER_1.username,
          password: PIM_USER_1.password,
        },
        headers: tfmApiHeaders(),
      })
      .then((response) => response.body.token);

  const compactAmendment = (amendment) => {
    if (!amendment || typeof amendment !== 'object') {
      return amendment;
    }

    return {
      _id: amendment._id,
      amendmentId: amendment.amendmentId,
      status: amendment.status,
      tfmStatus: amendment.tfmStatus,
      portalStatus: amendment.portalStatus,
      type: amendment.type,
      submissionType: amendment.submissionType,
      effectiveDate: amendment.effectiveDate,
      changeCoverEndDate: amendment.changeCoverEndDate,
      changeFacilityValue: amendment.changeFacilityValue,
      submittedByPim: amendment.submittedByPim,
      bankDecision: amendment.bankDecision,
    };
  };

  const compactApiBody = (body) => {
    if (Array.isArray(body)) {
      return {
        type: 'array',
        count: body.length,
        items: body.slice(0, 5).map(compactAmendment),
      };
    }

    if (body && typeof body === 'object') {
      const summary = {
        type: 'object',
        keys: Object.keys(body),
      };

      if (Array.isArray(body.amendments)) {
        summary.amendmentCount = body.amendments.length;
        summary.amendments = body.amendments.slice(0, 5).map(compactAmendment);
      }

      if (body.amendment) {
        summary.amendment = compactAmendment(body.amendment);
      }

      if (body.data && typeof body.data === 'string') {
        summary.data = body.data;
      }

      return summary;
    }

    return body;
  };

  const fetchEndpointSummary = (path, token) =>
    cy
      .request({
        url: `${tfmApiBaseUrl()}${path}`,
        method: 'GET',
        headers: tfmApiHeaders(token),
        failOnStatusCode: false,
      })
      .then((response) => ({
        path,
        status: response.status,
        body: compactApiBody(response.body),
      }));

  const collectButtonDiagnostics = ({ facilityId, buttonSelector }) => {
    const diagnosticSelectors = [
      addAmendmentSelector,
      addUnderwriterManagerDecisionSelector,
      '[data-cy="add-amendment-bank-decision-link"]',
      '[data-cy="amendment--in-progress-bar"]',
      '[data-cy="amendment-future-effective-date-facility-bar"]',
      '[data-cy="portal-amendment--in-progress-bar"]',
    ];

    return cy.location().then((location) =>
      cy.get('body').then(($body) => {
        const selectorState = diagnosticSelectors.reduce((acc, selector) => {
          const count = $body.find(selector).length;
          return { ...acc, [selector]: count };
        }, {});

        return getTfmApiToken().then((token) => {
          const diagnostics = {
            missingSelector: buttonSelector,
            url: location.href,
            pathname: location.pathname,
            selectorState,
            endpointState: {},
          };

          return fetchEndpointSummary(`/v1/facilities/${facilityId}/amendments`, token)
            .then((facilityAmendments) => {
              diagnostics.endpointState.facilityAmendments = facilityAmendments;
            })
            .then(() => fetchEndpointSummary(`/v1/facilities/${facilityId}/amendments/in-progress`, token))
            .then((facilityInProgress) => {
              diagnostics.endpointState.facilityInProgress = facilityInProgress;
            })
            .then(() => fetchEndpointSummary(`/v1/facilities/${facilityId}/amendments/completed`, token))
            .then((facilityCompleted) => {
              diagnostics.endpointState.facilityCompleted = facilityCompleted;
            })
            .then(() => fetchEndpointSummary(`/v1/deals/${dealId}/amendments/in-progress`, token))
            .then((dealInProgress) => {
              diagnostics.endpointState.dealInProgress = dealInProgress;
            })
            .then(() => fetchEndpointSummary(`/v1/deals/${dealId}/amendments/completed/latest`, token))
            .then((dealLatestCompleted) => {
              diagnostics.endpointState.dealLatestCompleted = dealLatestCompleted;
              return diagnostics;
            });
        });
      }),
    );
  };

  const clickButtonOrThrowDiagnostics = ({ facilityId, buttonSelector, clickButton }) =>
    cy.get('body', { timeout: 10000 }).then(($body) => {
      if ($body.find(buttonSelector).length > 0) {
        return clickButton();
      }

      return collectButtonDiagnostics({ facilityId, buttonSelector }).then((diagnostics) => {
        throw new Error(`Missing required button. ${JSON.stringify(diagnostics, null, 2)}`);
      });
    });

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, PIM_USER_1);
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should submit an amendment request', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    clickButtonOrThrowDiagnostics({
      facilityId,
      buttonSelector: addAmendmentSelector,
      clickButton: () => {
        amendmentsPage.addAmendmentButton().contains('Add an amendment request');
        return amendmentsPage.addAmendmentButton().click();
      },
    });
    cy.url().should('contain', 'request-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

    cy.clickContinueButton();

    cy.url().should('contain', 'request-approval');
    // manual approval
    amendmentsPage.amendmentRequestApprovalYes().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    // update both the cover end date and the facility value
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentFacilityValueCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date', day: tomorrow.day, month: today.monthLong, year: today.year });

    cy.clickContinueButton();

    cy.url().should('contain', 'facility-value');
    amendmentsPage.amendmentCurrentFacilityValue().should('contain', '12,345.00');
    cy.keyboardInput(amendmentsPage.amendmentFacilityValueInput(), '123');

    cy.clickContinueButton();
    cy.url().should('contain', 'check-answers');
    cy.clickContinueButton();
  });

  it('should take you to `Add underwriter decision - Facility value` page if a decision has been made for Cover End Date', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/underwriting`));

    clickButtonOrThrowDiagnostics({
      facilityId,
      buttonSelector: addUnderwriterManagerDecisionSelector,
      clickButton: () => {
        pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
        return pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });
      },
    });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().click();
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
  });

  it('should take you to `Add conditions, reasons and comments` page if a decision has been made for Facility Value and Cover End Date', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/underwriting`));

    clickButtonOrThrowDiagnostics({
      facilityId,
      buttonSelector: addUnderwriterManagerDecisionSelector,
      clickButton: () => {
        pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
        return pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });
      },
    });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('be.checked');
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().click();
    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', tomorrow.dayLong);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', oneMonth.dd_MMMM_yyyy);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);

    amendmentsPage.amendmentsManagersDecisionReasons().should('be.visible');
    amendmentsPage.amendmentsManagersDecisionComments().should('be.visible');

    continueButton().should('be.visible');
  });

  it('should take you to `Add conditions, reasons and comments` summary page', () => {
    cy.login(UNDERWRITER_MANAGER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/underwriting`));

    clickButtonOrThrowDiagnostics({
      facilityId,
      buttonSelector: addUnderwriterManagerDecisionSelector,
      clickButton: () => {
        pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().contains('Add decision');
        return pages.underwritingPage.addAmendmentUnderwriterManagerDecisionButton().click({ force: true });
      },
    });

    cy.url().should('contain', '/cover-end-date/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('be.checked');
    cy.clickContinueButton();

    cy.url().should('contain', '/facility-value/managers-decision');
    amendmentsPage.underWriterManagerDecisionRadioInputDecline().should('be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions');

    cy.keyboardInput(amendmentsPage.amendmentsManagersDecisionReasons(), 'This is the reason for declining the amendment');
    cy.keyboardInput(amendmentsPage.amendmentsManagersDecisionComments(), 'This is a comment visible only to UKEF staff');

    cy.clickContinueButton();
    cy.url().should('contain', '/managers-conditions/summary');
    amendmentsPage.amendmentSendToBankButton().should('be.visible');

    amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);
    amendmentsPage.amendmentDetails.row(1).newCoverEndDate().should('contain', tomorrow.dayLong);
    amendmentsPage.amendmentDetails.row(1).currentCoverEndDate().should('contain', oneMonth.dd_MMMM_yyyy);

    amendmentsPage.amendmentDetails.row(1).currentFacilityValue().should('contain', 'GBP 12,345.00');
    amendmentsPage.amendmentDetails.row(1).newFacilityValue().should('contain', 'GBP 123.00');
    amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue().should('contain', UNDERWRITER_MANAGER_DECISIONS.DECLINED);

    amendmentsPage.amendmentSendToBankButton().click();
  });

  it('should show not applicable badge for banks decision on amendments page since declined by underwriter', () => {
    cy.login(PIM_USER_1);
    cy.visit(relative(`/case/${dealId}/underwriting`));

    caseSubNavigation.dealLink().click();
    caseDealPage.dealFacilitiesTable.row(dealFacilities[0]._id).facilityId().click();
    facilityPage.facilityTabAmendments().click();

    amendmentsPage.amendmentDetails.row(1).bankDecisionTag().contains('Not applicable');
    amendmentsPage.amendmentDetails.row(1).effectiveDate().should('contain', NOT_ADDED.DASH);
  });
});
