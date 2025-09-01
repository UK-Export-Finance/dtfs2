const { PENDING_RECONCILIATION, RECONCILIATION_IN_PROGRESS, RECONCILIATION_COMPLETED } = require('@ukef/dtfs2-common');
const pageRenderer = require('../pageRenderer');

const page = 'utilisation-report-service/previous-reports/previous-reports.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const navItems = [
    {
      text: 2023,
      href: '?targetYear=2023',
      attributes: { 'data-cy': 'side-navigation-2023' },
      active: true,
    },
    {
      text: 2022,
      href: '?targetYear=2022',
      attributes: { 'data-cy': 'side-navigation-2022' },
      active: false,
    },
    {
      text: 2021,
      href: '?targetYear=2021',
      attributes: { 'data-cy': 'side-navigation-2021' },
      active: false,
    },
    {
      text: 2020,
      href: '?targetYear=2020',
      attributes: { 'data-cy': 'side-navigation-2020' },
      active: false,
    },
  ];

  const reports = [
    {
      linkText: 'January 2023',
      month: 'January',
      downloadPath: 'www.abc.com',
      status: PENDING_RECONCILIATION,
      displayStatus: 'Pending reconciliation',
    },
    {
      linkText: 'February 2023',
      month: 'February',
      downloadPath: 'www.abc.com',
      status: PENDING_RECONCILIATION,
      displayStatus: 'Pending reconciliation',
    },
    {
      linkText: 'March 2023',
      month: 'March',
      downloadPath: 'www.abc.com',
      status: RECONCILIATION_IN_PROGRESS,
      displayStatus: 'Reconciliation in progress',
    },
    {
      linkText: 'May 2023',
      month: 'May',
      downloadPath: 'www.abc.com',
      status: RECONCILIATION_COMPLETED,
      displayStatus: 'Report completed',
    },
  ];

  const year = 2023;

  describe('with submitted reports', () => {
    beforeEach(() => {
      wrapper = render({ navItems, reports, year });
    });

    it('should render side navigation bar', () => {
      wrapper.expectElement('[data-cy="container-side-navigation"]').toExist();
    });

    it('should render side navigation items', () => {
      wrapper.expectElement('[data-cy="side-navigation-2023"]').toExist();
      wrapper.expectElement('[data-cy="side-navigation-2022"]').toExist();
      wrapper.expectElement('[data-cy="side-navigation-2021"]').toExist();
      wrapper.expectElement('[data-cy="side-navigation-2020"]').toExist();
    });

    it('should render page heading', () => {
      wrapper.expectText('[data-cy="main-heading"]').toRead('Download 2023 GEF reports');
    });

    it('should render paragraph', () => {
      wrapper.expectText('[data-cy="paragraph"]').toRead('Reports are downloaded as CSV files.');
    });

    it('should render month links', () => {
      wrapper.expectElement('[data-cy="list-item-link-January"]').toExist();
      wrapper.expectText('[data-cy="list-item-link-January"]').toRead('January 2023 GEF report');
      wrapper.expectElement('[data-cy="list-item-link-February"]').toExist();
      wrapper.expectText('[data-cy="list-item-link-February"]').toRead('February 2023 GEF report');
      wrapper.expectElement('[data-cy="list-item-link-March"]').toExist();
      wrapper.expectText('[data-cy="list-item-link-March"]').toRead('March 2023 GEF report');
      wrapper.expectElement('[data-cy="list-item-link-May"]').toExist();
      wrapper.expectText('[data-cy="list-item-link-May"]').toRead('May 2023 GEF report');
    });

    it('should render report statuses', () => {
      wrapper.expectElement('[data-cy="utilisation-report-reconciliation-status"]').toHaveCount(4);
      wrapper.expectText('main').toContain('Report completed');
      wrapper.expectText('main').toContain('Reconciliation in progress');
      wrapper.expectText('main').toContain('Pending reconciliation');
    });
  });

  describe('with no submitted reports for target year', () => {
    beforeEach(() => {
      wrapper = render({ navItems, reports: [], year });
    });

    it('should render side navigation bar', () => {
      wrapper.expectElement('[data-cy="container-side-navigation"]').toExist();
    });

    it('should render side navigation items', () => {
      wrapper.expectElement('[data-cy="side-navigation-2023"]').toExist();
      wrapper.expectElement('[data-cy="side-navigation-2022"]').toExist();
      wrapper.expectElement('[data-cy="side-navigation-2021"]').toExist();
      wrapper.expectElement('[data-cy="side-navigation-2020"]').toExist();
    });

    it('should render page heading', () => {
      wrapper.expectText('[data-cy="main-heading"]').toRead('Download 2023 GEF reports');
    });

    it('should render paragraph', () => {
      wrapper.expectText('[data-cy="paragraph"]').toRead('No reports have been submitted.');
    });
  });

  describe('with no submitted reports for any year', () => {
    beforeEach(() => {
      wrapper = render({ navItems: [], reports: [], year });
    });

    it('should render page heading', () => {
      wrapper.expectText('[data-cy="main-heading"]').toRead('Download previous GEF reports');
    });

    it('should render paragraph', () => {
      wrapper.expectText('[data-cy="paragraph"]').toRead('No reports have been submitted.');
    });
  });
});
