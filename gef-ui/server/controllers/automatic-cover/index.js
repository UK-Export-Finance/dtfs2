import { decode } from 'html-entities';
import * as api from '../../services/api';
import { validationErrorHandler } from '../../utils/helpers';

function AutomaticCoverErrors(fields, items) {
  const receivedFields = Object.keys(fields); // Array of received fields i.e ['coverStart']
  const errorsToDisplay = items.filter((item) => !receivedFields.includes(item.id));

  return errorsToDisplay.map((error) => ({
    errRef: error.id,
    errMsg: error.errMsg,
  }));
}

const automaticCover = async (req, res) => {
  try {
    const cover = {
      version: 123,
      terms: [
        {
          id: 'coverStart',
          htmlText: decode('<p>12. The period between the Cover Start Date and the  Cover End Date does not exceed the Facility Maximum Cover Period.</p>'),
          errMsg: '12. Select if the Maximum Cover period has been exceeded',
        },
        {
          id: 'noticeDate',
          htmlText: decode('<p>13. The period between the Inclusion Notice Date and the Requested Cover Start Date does not exceed 3 months or such longer period as may be agreed by UKEF.</p>'),
          errMsg: '13. Select if the period between the includsion Notice Date and the Requested Cover Start Date exceeds 3 months or any other period agreed by UKEF',
        },
        {
          id: 'facilityLimit',
          htmlText: decode(`<p>14.  The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency ) of the facility is not more than the lesser of:</p>
                  <p>(i) the Available Master Guarantee Limit 
                  (ii) the Available Obligor’s limit</p>`),
          errMsg: '14. Select if the Covered Facility Limit is not more than the lowest of either of the 2 options',
        },
      ],
    }; // await api.getAutomaticCover();

    return res.render('partials/automatic-cover.njk', {
      terms: cover.terms,

    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateAutomaticCover = async (req, res) => {
  const { body } = req;

  const cover = {
    version: 123,
    terms: [
      {
        id: 'coverStart',
        htmlText: decode('<p>12. The period between the Cover Start Date and the  Cover End Date does not exceed the Facility Maximum Cover Period.</p>'),
        errMsg: '12. Select if the Maximum Cover period has been exceeded',
      },
      {
        id: 'noticeDate',
        htmlText: decode('<p>13. The period between the Inclusion Notice Date and the Requested Cover Start Date does not exceed 3 months or such longer period as may be agreed by UKEF.</p>'),
        errMsg: '13. Select if the period between the includsion Notice Date and the Requested Cover Start Date exceeds 3 months or any other period agreed by UKEF',
      },
      {
        id: 'facilityLimit',
        htmlText: decode(`<p>14.  The Covered Facility Limit (converted for this purpose into the Master Guarantee Base Currency ) of the facility is not more than the lesser of:</p>
                <p>(i) the Available Master Guarantee Limit 
                (ii) the Available Obligor’s limit</p>`),
        errMsg: '14. Select if the Covered Facility Limit is not more than the lowest of either of the 2 options',
      },
    ],
  };

  const automaticCoverErrors = new AutomaticCoverErrors(body, cover.terms);

  return res.render('partials/automatic-cover.njk', {
    errors: validationErrorHandler(automaticCoverErrors, 'automatic-cover'),
    terms: cover.terms,
    selected: body,
  });


  // try {
  //   const criteria = await api.getMandatoryCriteria();


  //   if (isEmpty) {
  //     const mandatoryError = {
  //       errRef: 'bankInternalRefName',
  //       errMsg: 'You must enter a bank reference or name',
  //     };
  //     return res.render('partials/mandatory-criteria.njk', {
  //       errors: validationErrorHandler(mandatoryError, 'mandatory-criteria'),
  //       criteria,
  //     });
  //   }

  //   if (parseBool(mandatoryCriteria)) {
  //     return res.redirect('name-application');
  //   }

  //   return res.redirect('ineligible');
  // } catch (err) {
  //   return res.render('partials/problem-with-service.njk');
  // }
};

export {
  automaticCover,
  validateAutomaticCover,
};
