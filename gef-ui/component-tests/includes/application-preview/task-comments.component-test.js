const { PORTAL_AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const pageRenderer = require('../../pageRenderer');

const page = 'includes/application-preview/task-comments.njk';
const render = pageRenderer(page);

const params = {
  displayComments: true,
  portalAmendmentStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
  dealId: '123',
  userRoles: ['maker'],
};

describe(page, () => {
  let wrapper;

  describe('Amendment details', () => {
    const amendmentDetailsHeader = `[data-cy="amendment-details-header"]`;
    const amendmentDetails = `[data-cy="amendment-details"]`;

    it('should be rendered when portalAmendmentStatus is submitted for review and login as a maker', () => {
      wrapper = render(params);

      wrapper.expectElement(amendmentDetailsHeader).toExist();
      wrapper.expectText(amendmentDetailsHeader).toRead(params.portalAmendmentStatus);
      wrapper.expectElement(amendmentDetails).toExist();
      wrapper.expectText(amendmentDetails).toRead('Amendment details');
    });

    it('should be rendered when portalAmendmentStatus is submitted for review and login as a checker', () => {
      wrapper = render({ ...params, userRoles: ['checker'] });

      wrapper.expectElement(amendmentDetailsHeader).toExist();
      wrapper.expectText(amendmentDetailsHeader).toRead(params.portalAmendmentStatus);
      wrapper.expectElement(amendmentDetails).toExist();
      wrapper.expectText(amendmentDetails).toRead('Check amendment details before submitting to UKEF');
    });

    it('should not be rendered when portalAmendmentStatus is null', () => {
      params.portalAmendmentStatus = null;
      wrapper = render({
        ...params,
      });

      wrapper.expectElement(amendmentDetailsHeader).notToExist();
      wrapper.expectElement(amendmentDetails).notToExist();
    });
  });
});
