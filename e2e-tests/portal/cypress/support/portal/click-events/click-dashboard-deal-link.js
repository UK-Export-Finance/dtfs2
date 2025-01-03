import { dashboardDeals } from '../../../e2e/pages';

/**
 * clickDashboardDealLink
 * Click a deal link in the dashboard.
 * @param {Integer} index: Dashboard row index
 */
const clickDashboardDealLink = () => {
  dashboardDeals.rowByIndex(0).link().click();
};

export default clickDashboardDealLink;
