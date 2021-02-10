const pageRenderer = require('../../../component-tests/pageRenderer');
const page = '../views/templates/mandatory-criteria.njk';
const render = pageRenderer(page);

describe('templates/mandatory-criteria', () => {
  let wrapper

  beforeEach(() => {
    wrapper = render()
  })

  it('should render eligibility criteria', () => {
    // wrapper.expect('[data-cy="mandatory-criteria"]').toRead('hello')
  })
})
