const { PORTAL_AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const pageRenderer = require('../../pageRenderer');

const page = 'includes/application-preview/summary.njk';
const render = pageRenderer(page);

const params = {
  portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
  isPortalAmendmentInProgress: true,
};

describe(page, () => {
  let wrapper;

  describe('Amendment status', () => {
    const amendmentStatus = `[data-cy="amendment-status"]`;

    it('should be rendered when portalAmendmentStatus is submitted for review', () => {
      wrapper = render(params);

      wrapper.expectElement(amendmentStatus).toExist();
      wrapper.expectText(amendmentStatus).toContain(params.portalAmendmentStatus);
    });

    it('should not be rendered when portalAmendmentStatus is null', () => {
      params.portalAmendmentStatus = null;
      params.isPortalAmendmentInProgress = false;
      wrapper = render({
        ...params,
      });

      wrapper.expectElement(amendmentStatus).notToExist();
    });
  });
});
