const { PORTAL_AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const pageRenderer = require('../../pageRenderer');

const page = 'includes/application-preview/task-comments.njk';
const render = pageRenderer(page);

const params = {
  displayComments: true,
  portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
  isPortalAmendmentStatusUnderway: true,
  dealId: '123',
};

describe(page, () => {
  let wrapper;

  describe('Amendment details', () => {
    const amendmentDetailsHeader = `[data-cy="amendment-details-header"]`;
    const amendmentDetails = `[data-cy="amendment-details"]`;

    it('should be rendered when portalAmendmentStatus is submitted for review', () => {
      wrapper = render(params);

      wrapper.expectElement(amendmentDetailsHeader).toExist();
      wrapper.expectElement(amendmentDetails).toExist();
    });

    it('should not be rendered when portalAmendmentStatus is null', () => {
      params.portalAmendmentStatus = null;
      params.isPortalAmendmentStatusUnderway = false;
      wrapper = render({
        ...params,
      });

      wrapper.expectElement(amendmentDetailsHeader).notToExist();
      wrapper.expectElement(amendmentDetails).notToExist();
    });
  });
});
