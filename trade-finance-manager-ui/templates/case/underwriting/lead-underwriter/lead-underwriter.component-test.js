const componentRenderer = require('../../../../component-tests/componentRenderer');

const page = '../templates/case/underwriting/lead-underwriter/lead-underwriter.njk';

const render = componentRenderer(page);

describe(page, () => {
  let params = {
    leadUnderwriter: {
      dealId: '1234',
      currentLeadUnderWriter: {
        firstName: 'Test',
        lastName: 'Testing',
        email: 'hello@test.com',
      },
    },
  };

  it('should NOT render `assign` link', () => {
    const wrapper = render(params);
    wrapper.expectElement('[data-cy="assign-lead-underwriter-link"]').notToExist();
  });

  it('should NOT render `change` link', () => {
    const wrapper = render(params);
    wrapper.expectElement('[data-cy="change-lead-underwriter-link"]').notToExist();
  });

  it('should render lead underwriter name', () => {
    const wrapper = render(params);
    const expected = `${params.leadUnderwriter.currentLeadUnderWriter.firstName} ${params.leadUnderwriter.currentLeadUnderWriter.lastName}`;
    wrapper.expectText('[data-cy="lead-underwriter-name"]').toRead(expected);
  });

  it('should render lead underwriter email', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="lead-underwriter-email"]').toRead(params.leadUnderwriter.currentLeadUnderWriter.email);
  });

  describe('with params.userCanEdit', () => {
    beforeEach(() => {
      params = {
        leadUnderwriter: {
          userCanEdit: true,
          ...params.leadUnderwriter,
        },
      };
    });

    it('should render `change` link', () => {
      const wrapper = render(params);
      wrapper.expectLink('[data-cy="change-lead-underwriter-link"]').toLinkTo(
        `/case/${params.leadUnderwriter.dealId}/underwriting/lead-underwriter/assign`,
        'Change',
      );
    });
  });

  describe('with no params.currentLeadUnderWriter and params.userCanEdit', () => {
    beforeEach(() => {
      params = {
        leadUnderwriter: {
          dealId: '1234',
          userCanEdit: true,
        },
      };
    });

    it('should render assign button', () => {
      const wrapper = render(params);

      wrapper.expectLink('[data-cy="assign-lead-underwriter-link"]').toLinkTo(
        `/case/${params.leadUnderwriter.dealId}/underwriting/lead-underwriter/assign`,
        'Add underwriter',
      );
    });
  });

  describe('with no params.currentLeadUnderWriter and no params.userCanEdit', () => {
    beforeEach(() => {
      params = {
        leadUnderwriter: {
          dealId: '1234',
          userCanEdit: false,
        },
      };
    });

    it('should render text saying unassigned', () => {
      const wrapper = render(params);

      wrapper.expectText('[data-cy="unassigned-underwriter-readonly"]').toRead('Unassigned');
    });
  });
});
