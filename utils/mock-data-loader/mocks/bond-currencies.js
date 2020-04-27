const BOND_CURRENCIES = [
  {
    currencyId: 1,
    text: 'U.A.E. Dirham',
    id: 'AED',
  },
  {
    currencyId: 2,
    text: 'Australian Dollars',
    id: 'AUD',
  },
  {
    currencyId: 3,
    text: 'Brazilian Real',
    id: 'BRL',
  },
  {
    currencyId: 4,
    text: 'Botswana Pula',
    id: 'BWP',
  },
  {
    currencyId: 5,
    text: 'Canadian Dollars',
    id: 'CAD',
  },
  {
    currencyId: 6,
    text: 'Swiss Francs',
    id: 'CHF',
  },
  {
    currencyId: 7,
    text: 'Czech Koruna',
    id: 'CZK',
  },
  {
    currencyId: 8,
    text: 'Danish Krone',
    id: 'DKK',
  },
  {
    currencyId: 9,
    text: 'Algerian Dinar',
    id: 'DZD',
    disbaled: true,
  },
  {
    currencyId: 10,
    text: 'Egyptian Pounds',
    id: 'EGP',
  },
  {
    currencyId: 11,
    text: 'Euros',
    id: 'EUR',
  },
  {
    currencyId: 12,
    text: 'UK Sterling',
    id: 'GBP',
  },
  {
    currencyId: 13,
    text: 'Hong Kong Dollars',
    id: 'HKD',
  },
  {
    currencyId: 14,
    text: 'Israeli Shekels',
    id: 'ILS',
  },
  {
    currencyId: 15,
    text: 'Indian Rupees',
    id: 'INR',
  },
  {
    currencyId: 16,
    text: 'Iraqi Dinar',
    id: 'IQD',
    disbaled: true,
  },
  {
    currencyId: 17,
    text: 'Jordanian Dinar',
    id: 'JOD',
  },
  {
    currencyId: 18,
    text: 'Japanese Yen',
    id: 'JPY',
  },
  {
    currencyId: 19,
    text: 'Kuwaiti Dinar',
    id: 'KWD',
  },
  {
    currencyId: 20,
    text: 'Sri Lankan Rupees',
    id: 'LKR',
  },
  {
    currencyId: 21,
    text: 'Lesotho Maluti',
    id: 'LSL',
    disbaled: true,
  },
  {
    currencyId: 22,
    text: 'Malawi Kwacha',
    id: 'MWK',
    disbaled: true,
  },
  {
    currencyId: 23,
    text: 'Mexican Pesos',
    id: 'MXN',
  },
  {
    currencyId: 24,
    text: 'Malaysian Ringgitts',
    id: 'MYR',
  },
  {
    currencyId: 25,
    text: 'Nigerian Naira',
    id: 'NGN',
  },
  {
    currencyId: 26,
    text: 'Norwegian Krone',
    id: 'NOK',
  },
  {
    currencyId: 27,
    text: 'New Zealand Dollars',
    id: 'NZD',
  },
  {
    currencyId: 28,
    text: 'Omani Rials',
    id: 'OMR',
  },
  {
    currencyId: 29,
    text: 'Pakistan Rupees',
    id: 'PKR',
  },
  {
    currencyId: 30,
    text: 'Polish Zloty',
    id: 'PLN',
  },
  {
    currencyId: 31,
    text: 'Qatar Rials',
    id: 'QAR',
  },
  {
    currencyId: 32,
    text: 'Saudi Arabian Riyals',
    id: 'SAR',
  },
  {
    currencyId: 33,
    text: 'Swedish Krona',
    id: 'SEK',
  },
  {
    currencyId: 34,
    text: 'Singapore Dollars',
    id: 'SGD',
  },
  {
    currencyId: 35,
    text: 'Thai Bahts',
    id: 'THB',
  },
  {
    currencyId: 36,
    text: 'Taiwan Dollars',
    id: 'TWD',
  },
  {
    currencyId: 37,
    text: 'US Dollars',
    id: 'USD',
  },
  {
    currencyId: 38,
    text: 'CFA Francs',
    id: 'XAF',
  },
  {
    currencyId: 39,
    text: 'Gold',
    id: 'XAU',
    disbaled: true,
  },
  {
    currencyId: 40,
    text: 'South African Rand',
    id: 'ZAR',
  },
  {
    currencyId: 41,
    text: 'Bahrain Dinar',
    id: 'BHD',
  },
  {
    currencyId: 42,
    text: 'Chinese Yuan Renminbi',
    id: 'CNY',
    disbaled: true,
  },
  {
    currencyId: 43,
    text: 'Philippine Peso',
    id: 'PHP',
  },
  {
    currencyId: 44,
    text: 'Uganda Shilling',
    id: 'UGX',
  },
  {
    currencyId: 46,
    text: 'Kenyan Shilling',
    id: 'KES',
  },
  {
    currencyId: 47,
    text: 'Pataca',
    id: 'MOP',
    disbaled: true,
  },
  {
    currencyId: 48,
    text: 'Chilean Peso',
    id: 'CLP',
  },
  {
    currencyId: 49,
    text: 'Hungarian Forint',
    id: 'HUF',
  },
  {
    currencyId: 50,
    text: 'Icelandic Krona',
    id: 'ISK',
  },
  {
    currencyId: 51,
    text: 'Indonesian Rupiah',
    id: 'IDR',
  },
  {
    currencyId: 52,
    text: 'Mauritian Rupee',
    id: 'MUR',
  },
  {
    currencyId: 53,
    text: 'Peruvian Sol',
    id: 'PEN',
  },
  {
    currencyId: 54,
    text: 'Russian Ruble ',
    id: 'RUB',
  },
  {
    currencyId: 55,
    text: 'South Korean Won',
    id: 'KRW',
  },
  {
    currencyId: 56,
    text: 'Turkish Lira',
    id: 'TRY',
  },
  {
    currencyId: 57,
    text: 'Uruguayan Peso',
    id: 'UYU',
  },
  {
    currencyId: 58,
    text: 'Zambian Kwacha',
    id: 'ZMK',
  },
  {
    currencyId: 59,
    text: 'Moroccan Dirham',
    id: 'MAD ',
  },
];

module.exports = BOND_CURRENCIES;
