const pageRenderer = require('../pageRenderer');
const { NON_MAKER_OR_CHECKER_ROLES } = require('../../test-helpers/common-role-lists');
const { MAKER, CHECKER } = require('../../server/constants/roles');

const page = 'includes/footer.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  describe(`when viewed with the role '${MAKER}'`, () => {
    beforeEach(() => {
      wrapper = render({
        user: {
          roles: [MAKER],
        },
      });
    });

    it('should render the feedback link', () => {
      wrapper.expectElement('[data-cy="feedback-link"]').toExist();
    });
  });

  describe(`when viewed with the role '${CHECKER}'`, () => {
    beforeEach(() => {
      wrapper = render({
        user: {
          roles: [CHECKER],
        },
      });
    });

    it('should render the feedback link', () => {
      wrapper.expectElement('[data-cy="feedback-link"]').toExist();
    });
  });

  describe.each(NON_MAKER_OR_CHECKER_ROLES)('when viewed with the role \'%s\'', (nonMakerOrCheckerRole) => {
    beforeEach(() => {
      wrapper = render({
        user: {
          roles: [nonMakerOrCheckerRole],
        },
      });
    });

    it('should NOT render the feedback link', () => {
      wrapper.expectElement('[data-cy="feedback-link"]').notToExist();
    });
  });
});
