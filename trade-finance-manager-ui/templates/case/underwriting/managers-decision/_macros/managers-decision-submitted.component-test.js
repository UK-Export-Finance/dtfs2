const componentRenderer = require('../../../../../component-tests/componentRenderer');

const component = '../templates/case/underwriting/managers-decision/_macros/managers-decision-submitted.njk';
const localiseTimestamp = require('../../../../../server/nunjucks-configuration/filter-localiseTimestamp');

const render = componentRenderer(component);

describe(component, () => {
  let params = {
    decision: {
      userFullName: 'Joe Bloggs',
      timestamp: '1606900616651',
    },
    user: {
      timezone: 'Europe/London',
    },
  };

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

      wrapper.expectText('[data-cy="decision-made-by-value"]').toRead(params.decision.userFullName);
    });
  });

  describe('date and time', () => {
    it('should render heading', () => {
      const wrapper = render(params);

      wrapper.expectText('[data-cy="date-time-heading"]').toRead('Date and time');
    });

    it('should render value', () => {
      const wrapper = render(params);

      const formattedDay = localiseTimestamp(params.decision.timestamp, 'DD MMMM YYYY', params.user.timezone);
      const formattedTime = localiseTimestamp(params.decision.timestamp, 'HH:mm', params.user.timezone);

      const expected = `${formattedDay} at ${formattedTime}`;
      wrapper.expectText('[data-cy="date-time-value"]').toRead(expected);
    });
  });

  describe('with tfm.underwriterManagersDecision.comments', () => {
    const paramsWithComments = {
      ...params,
      decision: {
        ...params.decision,
        comments: 'Testing 123',
      },
    };

    describe('comments heading', () => {
      it('should render `Conditions` text', () => {
        params = {
          ...paramsWithComments,
          decision: {
            ...paramsWithComments.decision,
            decision: 'Approved (with conditions)',
          },
        };

        const wrapper = render(params);

        wrapper.expectText('[data-cy="comments-heading"]').toRead('Conditions');
      });

      it('should render `Reasons` text when decision is `Declined`', () => {
        params = {
          ...paramsWithComments,
          decision: {
            ...paramsWithComments.decision,
            decision: 'Declined',
          },
        };

        const wrapper = render(params);

        wrapper.expectText('[data-cy="comments-heading"]').toRead('Reasons');
      });
    });

    it('should render `Conditions` / comments value', () => {
      const wrapper = render(paramsWithComments);

      wrapper.expectElement('[data-cy="conditions-value"]').toExist();
      wrapper.expectElement('[data-cy="conditions-value"]').hasClass('ukef-preserve-white-space');
    });
  });

  describe('with tfm.underwriterManagersDecision.internalComments', () => {
    const paramsWithInternalComments = {
      ...params,
      decision: {
        ...params.decision,
        internalComments: 'Testing 123',
      },
    };

    it('should render `Internal Comments` heading', () => {
      const wrapper = render(paramsWithInternalComments);

      wrapper.expectText('[data-cy="internal-comments-heading"]').toRead('Comments');
    });

    it('should render `Internal Comments` value', () => {
      const wrapper = render(paramsWithInternalComments);

      wrapper.expectElement('[data-cy="internal-comments-value"]').toExist();
      wrapper.expectElement('[data-cy="internal-comments-value"]').hasClass('ukef-preserve-white-space');
    });
  });
});
