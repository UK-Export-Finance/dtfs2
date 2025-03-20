import { dashboardDeals } from '../../../e2e/pages';

/**
 * clickDashboardDealLink
 * Click a deal link in the dashboard.
 * @param {number} [index=0] - Dashboard row index (defaults to 0 if not provided)
 */
const clickDashboardDealLink = (index = 0) => {
  dashboardDeals.rowByIndex(index).link().click();
};

export default clickDashboardDealLink;
