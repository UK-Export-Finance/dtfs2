const pageRenderer = require('../../../../component-tests/pageRenderer');

const page = '../templates/case/underwriting/lead-underwriter/lead-underwriter.njk';

const render = pageRenderer(page);

describe(page, () => {
  let params = {
    dealId: '1234',
    currentLeadUnderWriter: {
      firstName: 'Test',
      lastName: 'Testing',
      email: 'hello@test.com',
    },
  };

  it('should render heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="underwriting-heading"]').toRead('Underwriting');
  });

  it('should render Lead Underwriter heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="lead-underwriter-heading"]').toRead('Lead Underwriter');
  });

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
    const expected = `${params.currentLeadUnderWriter.firstName} ${params.currentLeadUnderWriter.lastName}`;
    wrapper.expectText('[data-cy="lead-underwriter-name"]').toRead(expected);
  });

  it('should render lead underwriter email', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="lead-underwriter-email"]').toRead(params.currentLeadUnderWriter.email);
  });

  describe('with params.userCanEdit', () => {
    beforeEach(() => {
      params = {
        ...params,
        userCanEdit: true,
      };
    });

    it('should render `change` link', () => {
      const wrapper = render(params);
      wrapper.expectLink('[data-cy="change-lead-underwriter-link"]').toLinkTo(
        `/case/${params.dealId}/underwriting/lead-underwriter/assign`,
        'Change',
      );
    });
  });

  describe('with no params.currentLeadUnderWriter and params.userCanEdit', () => {
    beforeEach(() => {
      params = {
        dealId: '1234',
        userCanEdit: true,
      };
    });

    it('should render assign link', () => {
      const wrapper = render(params);

      wrapper.expectLink('[data-cy="assign-lead-underwriter-link"]').toLinkTo(
        `/case/${params.dealId}/underwriting/lead-underwriter/assign`,
        'Assign a lead underwriter',
      );
    });
  });
});
