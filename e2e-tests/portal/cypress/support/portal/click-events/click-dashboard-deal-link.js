import { dashboardDeals } from '../../../e2e/pages';

/**
 * clickDashboardDealLink
 * Click a deal link in the dashboard.
 * @param {Integer} index: Dashboard row index
 */
const clickDashboardDealLink = (index) => {
  dashboardDeals.rowIndex.link(index).click();
};

export default clickDashboardDealLink;
