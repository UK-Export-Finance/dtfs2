const { PORTAL_AMENDMENT_STATUS, ROLES } = require('@ukef/dtfs2-common');
const pageRenderer = require('../../pageRenderer');
const { PORTAL_AMENDMENT_PAGES } = require('../../../server/constants/amendments');

const { AMENDMENT_DETAILS } = PORTAL_AMENDMENT_PAGES;

const page = 'includes/application-preview/task-comments.njk';
const render = pageRenderer(page);

const params = {
  displayComments: true,
  dealId: '123',
  userRoles: [ROLES.MAKER],
  readyForCheckerAmendmentDetailsUrlAndText: [],
  furtherMakersInputAmendmentDetailsUrlAndText: [],
  readyForCheckerAmendmentStatusHeading: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
  furtherMakersInputAmendmentStatusHeading: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
};

describe(page, () => {
  let wrapper;

  const amendmentDetailsHeaderCheckersApproval = `[data-cy="amendment-details-header-ready-for-checkers"]`;
  const amendmentDetailsHeaderFurtherMakersInput = `[data-cy="amendment-details-header-further-makers-input"]`;

  const amendmentDetails = (index) => `[data-cy="amendment-details-${index}"]`;
  const amendmentDetailsUrl = (id) => `/gef/application-details/${id}/facilities/${id}/amendments/${id}/${AMENDMENT_DETAILS}`;
  const amendmentDetailsText = (id) => `Facility (${id}) amendment details`;

  describe('Amendment details', () => {
    describe(`Amendments ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL} only`, () => {
      it(`should render the ready for checkers approval heading and facility when there is only 1 amendment`, () => {
        wrapper = render({
          ...params,
          readyForCheckerAmendmentDetailsUrlAndText: [{ text: amendmentDetailsText(1), amendmentDetailsUrl: amendmentDetailsUrl(1) }],
        });

        wrapper.expectElement(amendmentDetailsHeaderCheckersApproval).toExist();
        wrapper.expectText(amendmentDetailsHeaderCheckersApproval).toRead(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL);
        wrapper.expectElement(amendmentDetails(1)).toExist();
        wrapper.expectText(amendmentDetails(1)).toRead(amendmentDetailsText(1));
      });

      it(`should NOT render the further makers input approval heading`, () => {
        wrapper = render({
          ...params,
          readyForCheckerAmendmentDetailsUrlAndText: [{ text: amendmentDetailsText(1), amendmentDetailsUrl: amendmentDetailsUrl(1) }],
        });

        wrapper.expectElement(amendmentDetailsHeaderFurtherMakersInput).notToExist();
      });

      it(`should render the ready for checkers approval heading and facility with multiple amendments`, () => {
        wrapper = render({
          ...params,
          readyForCheckerAmendmentDetailsUrlAndText: [
            { text: amendmentDetailsText(1), amendmentDetailsUrl: amendmentDetailsUrl(1) },
            { text: amendmentDetailsText(2), amendmentDetailsUrl: amendmentDetailsUrl(2) },
          ],
        });

        wrapper.expectElement(amendmentDetailsHeaderCheckersApproval).toExist();
        wrapper.expectText(amendmentDetailsHeaderCheckersApproval).toRead(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL);

        wrapper.expectElement(amendmentDetails(1)).toExist();
        wrapper.expectText(amendmentDetails(1)).toRead(amendmentDetailsText(1));

        wrapper.expectElement(amendmentDetails(2)).toExist();
        wrapper.expectText(amendmentDetails(2)).toRead(amendmentDetailsText(2));
      });
    });

    describe(`Amendments ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} only`, () => {
      it(`should render the further makers input heading and facility when there is only 1 amendment`, () => {
        wrapper = render({
          ...params,
          furtherMakersInputAmendmentDetailsUrlAndText: [{ text: amendmentDetailsText(1), amendmentDetailsUrl: amendmentDetailsUrl(1) }],
        });

        wrapper.expectElement(amendmentDetailsHeaderFurtherMakersInput).toExist();
        wrapper.expectText(amendmentDetailsHeaderFurtherMakersInput).toRead(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED);
        wrapper.expectElement(amendmentDetails(1)).toExist();
        wrapper.expectText(amendmentDetails(1)).toRead(amendmentDetailsText(1));
      });

      it(`should NOT render the ready for ready for checkers approval heading`, () => {
        wrapper = render({
          ...params,
          furtherMakersInputAmendmentDetailsUrlAndText: [{ text: amendmentDetailsText(1), amendmentDetailsUrl: amendmentDetailsUrl(1) }],
        });

        wrapper.expectElement(amendmentDetailsHeaderCheckersApproval).notToExist();
      });

      it(`should render the further makers input heading and facility with multiple amendments`, () => {
        wrapper = render({
          ...params,
          furtherMakersInputAmendmentDetailsUrlAndText: [
            { text: amendmentDetailsText(1), amendmentDetailsUrl: amendmentDetailsUrl(1) },
            { text: amendmentDetailsText(2), amendmentDetailsUrl: amendmentDetailsUrl(2) },
          ],
        });

        wrapper.expectElement(amendmentDetailsHeaderFurtherMakersInput).toExist();
        wrapper.expectText(amendmentDetailsHeaderFurtherMakersInput).toRead(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED);

        wrapper.expectElement(amendmentDetails(1)).toExist();
        wrapper.expectText(amendmentDetails(1)).toRead(amendmentDetailsText(1));

        wrapper.expectElement(amendmentDetails(2)).toExist();
        wrapper.expectText(amendmentDetails(2)).toRead(amendmentDetailsText(2));
      });
    });

    describe(`Amendments ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL} and ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED}`, () => {
      it(`should render the ready for checkers approval heading further makers input heading and amendments`, () => {
        wrapper = render({
          ...params,
          readyForCheckerAmendmentDetailsUrlAndText: [{ text: amendmentDetailsText(1), amendmentDetailsUrl: amendmentDetailsUrl(1) }],
          furtherMakersInputAmendmentDetailsUrlAndText: [{ text: amendmentDetailsText(2), amendmentDetailsUrl: amendmentDetailsUrl(2) }],
        });

        wrapper.expectElement(amendmentDetailsHeaderCheckersApproval).toExist();
        wrapper.expectText(amendmentDetailsHeaderCheckersApproval).toRead(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL);

        wrapper.expectElement(amendmentDetailsHeaderFurtherMakersInput).toExist();
        wrapper.expectText(amendmentDetailsHeaderFurtherMakersInput).toRead(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED);

        wrapper.expectElement(amendmentDetails(1)).toExist();
        wrapper.expectText(amendmentDetails(1)).toContain(amendmentDetailsText(1));
        wrapper.expectText(amendmentDetails(1)).toContain(amendmentDetailsText(2));
      });
    });

    describe(`No amendments`, () => {
      it(`should NOT render any headings`, () => {
        wrapper = render(params);

        wrapper.expectElement(amendmentDetailsHeaderCheckersApproval).notToExist();

        wrapper.expectElement(amendmentDetailsHeaderFurtherMakersInput).notToExist();
      });
    });
  });
});
