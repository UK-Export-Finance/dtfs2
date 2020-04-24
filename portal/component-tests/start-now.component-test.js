const pageRenderer = require('./pageRenderer');
const page = 'start-now.njk';
const render = pageRenderer(page);

describe(page, () => {
  let $;

  describe('viewed by a maker', () => {
    const user = {
      roles:['maker'],
    };

    beforeAll( ()=>{
      $ = render({user})
    });

    it('displays 2 links to the dashboard', () => {
      $.expectLink('[data-cy="dashboardLink1"]')
        .toLinkTo('/dashboard', 'dashboard');
      $.expectLink('[data-cy="dashboardLink2"]')
        .toLinkTo('/dashboard', 'View dashboard');
    });

    it('displays a primary button linking to /before-you-start', () => {
      $.expectPrimaryButton('[data-cy="CreateNewSubmission"]')
        .toLinkTo('/before-you-start', 'Create new submission');
    });
  })

  describe('viewed by a checker', () => {
    const user = {
      roles:['checker'],
    };

    beforeAll( ()=>{
      $ = render({user})
    });

    it('displays 1 link to the dashboard', () => {
      $.expectLink('[data-cy="dashboardLink1"]')
        .toLinkTo('/dashboard', 'dashboard');
    });

    it('displays a primary button linking to /dashboard', () => {
      $.expectPrimaryButton('[data-cy="ViewDashboard"]')
        .toLinkTo('/dashboard', 'View dashboard');
    });
  })

});
