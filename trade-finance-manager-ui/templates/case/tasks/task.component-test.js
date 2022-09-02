const pageRenderer = require('../../../component-tests/pageRenderer');

const page = '../templates/case/tasks/task.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    dealId: '100200',
    deal: {
      submissionType: 'Automatic Inclusion Notice',
      details: {
        ukefDealId: '1234',
      },
      submissionDetails: {
        supplierName: 'Supplier name',
        buyerName: 'Buyer name',
      },
    },
    task: {
      title: 'Task title',
      team: {
        name: 'Business support group',
      },
    },
    user: {
      timezone: 'Europe/London',
      firstName: 'Joe',
      lastName: 'Bloggs',
    },
    assignToSelectOptions: [
      {
        value: 'Unassigned',
        text: 'Unassigned',
        selected: false,
      },
      {
        value: '12345678',
        text: 'Sarah Jones',
        selected: false,
      },
    ],
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render task heading', () => {
    wrapper.expectText('[data-cy="task-heading"]').toRead(params.task.title);
  });

  it('should render deal heading', () => {
    wrapper.expectText('[data-cy="deal-heading"]').toRead('Deal');
  });

  it('should render deal subheading', () => {
    const expected = `${params.deal.details.ukefDealId} ${params.deal.submissionDetails.supplierName} > ${params.deal.submissionDetails.buyerName}`;
    wrapper.expectText('[data-cy="deal-subheading"]').toRead(expected);
  });

  it('should render deal subheading link to deal', () => {
    wrapper.expectLink('[data-cy="deal-subheading-link"]')
      .toLinkTo(`/case/${params.dealId}/deal`, params.deal.details.ukefDealId);
  });

  it('should render type of work heading', () => {
    wrapper.expectText('[data-cy="type-of-work-heading"]').toRead('Type of work');
  });

  it('should render type of work subheading', () => {
    wrapper.expectText('[data-cy="type-of-work-subheading"]').toRead(params.deal.submissionType);
  });

  it('should render team heading', () => {
    wrapper.expectText('[data-cy="team-heading"]').toRead('Team');
  });

  it('should render team subheading', () => {
    wrapper.expectText('[data-cy="team-subheading"]').toRead(params.task.team.name);
  });

  describe('form', () => {
    it('should render `assigned to` select input', () => {
      wrapper.expectElement('[data-cy="assigned-to-select-input"]').toExist();
    });

    it('should render `status` radio inputs', () => {
      wrapper.expectElement('[data-cy="task-status-to-do"]').toExist();
      wrapper.expectElement('[data-cy="task-status-in-progress"]').toExist();
      wrapper.expectElement('[data-cy="task-status-done"]').toExist();
    });

    it('should render submit button', () => {
      wrapper.expectElement('[data-cy="submit-button"]').toExist();
      wrapper.expectText('[data-cy="submit-button"]').toRead('Save and close');
    });

    it('should render close link', () => {
      wrapper.expectLink('[data-cy="close-link"]')
        .toLinkTo(`/case/${params.dealId}/tasks`, 'Close without saving');
    });
  });
});
