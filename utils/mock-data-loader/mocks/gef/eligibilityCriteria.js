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
        id: 'coverStart',
        htmlText: escape('<p>12. The period between the Cover Start Date and the Cover End Date does not exceed the Facility Maximum Cover Period.</p>'),
        errMsg: '12. Select if the Maximum Cover period has been exceeded',
      },
      {
        id: 'noticeDate',
        htmlText: escape('<p>13. The period between the Inclusion Notice Date and the Requested Cover Start Date does not exceed 3 months (or such longer period as may be agreed by UK Export Finance).</p>'),
        errMsg: '13. Select if the period between the Inclusion Notice Date and the Requested Cover Start Date exceeds 3 months (or any other period agreed by UK Export Finance)',
      },
      {
        id: 'facilityLimit',
        htmlText: escape(`<p>14.  The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency ) of the facility is not more than the lesser of:</p>
                <div class="lower-roman-with-parens">
                <ol type="i">
                <li>the Available Master Guarantee Limit; and</li> 
                <li>the Available Obligor's limit</li>
                </ol>`),
        errMsg: '14. Select if the Covered Facility Limit is not more than the lowest of either of the 2 options',
      },
      {
        id: 'exporterDeclaration',
        htmlText: escape(`<p>15. The  Bank  has  received  an  Exporter  Declaration  which  confirms  that  the  Exporter  is  not
involved  with  any  of  the  following  industry  sectors:  sharp  arms  defence,  nuclear
radiological, biological, human cloning, pornography, gambling, tobacco, coal, oil, gas or
fossil fuel energy and the Bank Team is not aware that any information contained in that
Exporter Declaration is inaccurate in any material respect.</p>`),
        errMsg: '15. Select if the Bank has received an Exporter Declaration and the Exporter is not involved in any of the listed sectors',
      },
      {
        id: 'dueDiligence',
        htmlText: escape(`<p>16. The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its 
policies and procedures without having to escalate any issue raised during its Bank Due 
Diligence  internally  to  any  Relevant  Person  for  approval  as  part  of  its  usual  Bank  Due 
Diligence.</p>`),
        errMsg: '16. Select if the Bank has completed its Due Diligence',
      },
      {
        id: 'facilityLetter',
        htmlText: escape(`<p>17. Facility  Letter  satisfies  the  following  conditions:  in  relation  to  which,  any  upfront, 
arrangement or similar fee, (in the case of a Cash Facility) any ordinary interest rate and 
(in the case of a Contingent Facility) any Risk Margin Fee:
<div class="lower-roman-with-parens">
<ol type="i">
<li>has  been  set  in  accordance  with  the  Bank's  normal  pricing  policies  consistently applied;</li>
<li>has been set in accordance with the overall minimum pricing requirements, if any, 
most recently notified by UK Export Finance to the Bank;</li>
<li>(where  the  Covered  Facility  Limit  in  relation  to  the  Facility  is  more  than  the 
Available   Obligor(s)   Limit)   has   been   set   in   accordance   with   the   overall   pricing 
requirements,  if  any,  most  recently  notified  by  UK  Export  Finance  to  the  Bank  for  the 
relevant Obligor(s); and</li>
<li>(in  the  case  of  a  Cash  Facility)  any  ordinary  interest  rate  and  (in  the  case  of  a 
Contingent  Facility)  any  Risk  Margin  Fee  cover  the  whole  Cover  Period  of  the  Covered 
Facility</li>
</ol>

</div>
</p>`),
        errMsg: '17. Select if the Facility Letter satisfies the following conditions',
      },
      {
        id: 'facilityBaseCurrency',
        htmlText: escape(`<p>18. Facility Base Currency satisfies the following conditions: is denominated in an Approved 
Payment Currency.</p>`),
        errMsg: '18. Select if the Facility Base Currency satisfies the condition',
      },
      {
        id: 'facilityPaymentCurrency',
        htmlText: escape(`<p>19. Facility  Letter  satisfies  the  following  conditions:  in  relation  to  which,  any  upfront, 
arrangement or similar fee, (in the case of a Cash Facility) any ordinary interest rate and 
(in the case of a Contingent Facility) any Risk Margin Fee, is denominated in an Approved 
Payment Currency. </p>`),
        errMsg: '19. Select if the Facility Letter satisfies the condition',
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
