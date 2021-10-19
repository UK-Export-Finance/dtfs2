const escape = require('escape-html');

const ELIGIBILITY_CRITERIA = [
  {
    version: 1,
    isInDraft: false,
    createdAt: '2021-01-02T00:00',
    terms: [{
      htmlText: escape('<p>x. this one shouldn\'t show as it\'s an old version</p>'),
      errMsg: 'x. this one shouldn\'t show as it\'s an old version',
    }],
  },
  {
    version: 1.5,
    isInDraft: false,
    createdAt: '2021-01-02T00:00',
    terms: [
      {
        id: 12,
        name: 'coverStart',
        htmlText: escape('<p>12. The period between the Cover Start Date and the  Cover End Date does not exceed the Facility Maximum Cover Period.</p>'),
        errMsg: '12. Select if the Maximum Cover period has been exceeded',
      },
      {
        id: 13,
        name: 'noticeDate',
        htmlText: escape('<p>13. The period between the Inclusion Notice Date and the Requested Cover Start Date does not exceed 3 months or such longer period as may be agreed by UKEF.</p>'),
        errMsg: '13. Select if the period between the includsion Notice Date and the Requested Cover Start Date exceeds 3 months or any other period agreed by UKEF',
      },
      {
        id: 14,
        name: 'facilityLimit',
        htmlText: escape(`<p>14.  The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency ) of the facility is not more than the lesser of:</p>
                <p>(i) the Available Master Guarantee Limit 
                (ii) the Available Obligor's limit</p>`),
        errMsg: '14. Select if the Covered Facility Limit is not more than the lowest of either of the 2 options',
      },
    ],
  },
  {
    version: 3,
    isInDraft: true,
    createdAt: '2021-01-02T00:00',
    terms: [
      {
        id: 'coverStart',
        htmlText: escape('<p>x. this one shouldn\'t show as it\'s in draft</p>'),
        errMsg: 'x. this one shouldn\'t show as it\'s in draft',
      },
    ],
  },
];

module.exports = ELIGIBILITY_CRITERIA;
