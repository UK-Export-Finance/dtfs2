const { PORTAL_AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const pageRenderer = require('../../pageRenderer');

const page = 'includes/application-preview/task-comments.njk';
const render = pageRenderer(page);

const params = {
  displayComments: true,
  portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
  isPortalAmendmentInProgress: true,
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
      wrapper.expectText(amendmentDetailsHeader).toContain(params.portalAmendmentStatus);
      wrapper.expectElement(amendmentDetails).toExist();
      wrapper.expectText(amendmentDetails).toContain('Amendment details');
    });

    it('should not be rendered when portalAmendmentStatus is null', () => {
      params.portalAmendmentStatus = null;
      params.isPortalAmendmentInProgress = false;
      wrapper = render({
        ...params,
      });

      wrapper.expectElement(amendmentDetailsHeader).notToExist();
      wrapper.expectElement(amendmentDetails).notToExist();
    });
  });
});
