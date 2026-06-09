/**
 * Initial seed for the `portal-bank-list` MongoDB collection.
 *
 * Mirrors the order of the hardcoded bank list currently shown on the
 * portal homepage in `portal-ui/templates/_partials/before-you-start.njk`.
 *
 * After the first seed, the team maintains this list manually via MongoDB Compass
 */
module.exports = [
  { name: 'Barclays Bank', order: 1 },
  { name: 'HSBC UK Bank', order: 2 },
  { name: 'Lloyds Bank', order: 3 },
  { name: 'Bank of Scotland', order: 4 },
  { name: 'Westminster Bank', order: 5 },
  { name: 'Royal Bank of Scotland', order: 6 },
  { name: 'Ulster Bank', order: 7 },
  { name: 'Santander UK plc.', order: 8 },
  { name: 'Newable Bank', order: 9 },
  { name: 'Emirates NBD Bank (P.J.S.C)', order: 10 },
  { name: 'Virgin Money', order: 11 },
  { name: 'Shawbrook Bank', order: 12 },
  { name: 'ICICI', order: 13 },
  { name: 'ABC Bank', order: 14 },
  { name: 'LDF Operations (trading as White Oak)', order: 15 },
  { name: 'KBC Bank', order: 16 },
  { name: 'Banco Santander', order: 17 },
  { name: 'Nighthawk Partners', order: 18 },
];
