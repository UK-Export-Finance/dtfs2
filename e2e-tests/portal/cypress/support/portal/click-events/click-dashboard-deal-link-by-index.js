import { dashboardDeals } from '../../../e2e/pages';

/**
 * clickDashboardDealLinkByIndex
 * Click a deal link in the dashboard.
 * @param {number} [index=0] - Dashboard row index (defaults to 0 if not provided)
 */
const clickDashboardDealLinkByIndex = (index = 0) => {
  dashboardDeals.rowByIndex(index).link().click();
};

export default clickDashboardDealLinkByIndex;
