const pageRenderer = require('../../../../component-tests/pageRenderer');
const page = '../templates/case/underwriting/managers-decision/managers-decision-submitted.njk'
const filterLocaliseTimestamp = require('../../../../server/nunjucks-configuration/filter-localiseTimestamp');

const render = pageRenderer(page);

const localiseTimestamp = filterLocaliseTimestamp.default;

describe(page, () => {
  let wrapper;
  let params = {
    tfm: {
      underwriterManagersDecision: {
        userFullName: 'Joe Bloggs',
        timestamp: '1606900616651',
      },
    },
    user: {
      timezone: 'Europe/London',
    },
  };

  it('should render heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="managers-decision-heading"]').toRead('Underwriter manager’s decision');
  });

  it('should render subheading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="managers-decision-subheading"]').toRead('Decision');
  });

  it('should render status tag component', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="decision-status-tag"]').toExist();
  });

  describe('decision made by me', () => {
    it('should render heading', () => {
      const wrapper = render(params);

      wrapper.expectText('[data-cy="decision-made-by-heading"]').toRead('Decision made by');
    });

    it('should render value', () => {
      const wrapper = render(params);

      wrapper.expectText('[data-cy="decision-made-by-value"]').toRead(params.tfm.underwriterManagersDecision.userFullName);
    });
  });

  describe('date and time', () => {
    it('should render heading', () => {
      const wrapper = render(params);

      wrapper.expectText('[data-cy="date-time-heading"]').toRead('Date and time');
    });

    it('should render value', () => {
      const wrapper = render(params);

      const formattedDay = localiseTimestamp(params.tfm.underwriterManagersDecision.timestamp, 'D MMMM YYYY', params.user.timezone);
      const formattedTime = localiseTimestamp(params.tfm.underwriterManagersDecision.timestamp, 'HH:mm', params.user.timezone);

      const expected = `${formattedDay} at ${formattedTime}`;
      wrapper.expectText('[data-cy="date-time-value"]').toRead(expected);
    });
  });

  describe('with tfm.underwriterManagersDecision.comments', () => {
    const paramsWithComments = {
      ...params,
      tfm: {
        ...params.tfm,
        underwriterManagersDecision: {
          ...params.tfm.underwriterManagersDecision,
          comments: 'Testing 123',
        },
      },
    };

    it('should render `Conditions` / comments heading', () => {
      const wrapper = render(paramsWithComments);

      wrapper.expectText('[data-cy="conditions-heading"]').toRead('Conditions');
    });

    it('should render `Conditions` / comments value', () => {
      const wrapper = render(paramsWithComments);

      wrapper.expectElement('[data-cy="conditions-value"]').toExist();
      wrapper.expectElement('[data-cy="conditions-value"]').hasClass('preserve-white-space');
    });
  });

  describe('with tfm.underwriterManagersDecision.internalComments', () => {
    const paramsWithInternalComments = {
      ...params,
      tfm: {
        ...params.tfm,
        underwriterManagersDecision: {
          ...params.tfm.underwriterManagersDecision,
          internalComments: 'Testing 123',
        },
      },
    };

    it('should render `Internal Comments` heading', () => {
      const wrapper = render(paramsWithInternalComments);

      wrapper.expectText('[data-cy="internal-comments-heading"]').toRead('Comments');
    });

    it('should render `Internal Comments` value', () => {
      const wrapper = render(paramsWithInternalComments);

      wrapper.expectElement('[data-cy="internal-comments-value"]').toExist();
      wrapper.expectElement('[data-cy="internal-comments-value"]').hasClass('preserve-white-space');
    });
  });
});
