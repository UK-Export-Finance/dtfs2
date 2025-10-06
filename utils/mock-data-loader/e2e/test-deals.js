const { dealsSearchDeals } = require('./deals-search-deals');
const { dealsSortByBuyer } = require('./deals-sort-by-buyer');
const { dealsSortByExporter } = require('./deals-sort-by-exporter');
const { dealsSortByProduct } = require('./deals-sort-by-product');
const { dealsSortByReceivedDate } = require('./deals-sort-by-received-date');
const { dealsSortByStage } = require('./deals-sort-by-stage');
const { dealsSortByUkefId } = require('./deals-sort-by-ukef-id');

exports.testDeals = (params) => {
  if (params.includes('deal-search')) {
    return dealsSearchDeals();
  }

  if (params.includes('deals-sort-by-buyer')) {
    return dealsSortByBuyer();
  }

  if (params.includes('deals-sort-by-exporter')) {
    return dealsSortByExporter();
  }

  if (params.includes('deals-sort-by-product')) {
    return dealsSortByProduct();
  }

  if (params.includes('deals-sort-by-received-date')) {
    return dealsSortByReceivedDate();
  }

  if (params.includes('deals-sort-by-stage')) {
    return dealsSortByStage();
  }

  if (params.includes('deals-sort-by-ukef-id')) {
    return dealsSortByUkefId();
  }

  throw new Error(`No insertions found for keywords: ${params.join(', ')}`);
};
