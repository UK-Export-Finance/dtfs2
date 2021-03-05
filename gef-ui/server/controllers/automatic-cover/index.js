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

function fieldContainsAFalseBoolean(fields) {
  const receivedFields = Object.values(fields);
  return receivedFields.some((field) => field === 'false');
}

const automaticCover = async (req, res) => {
  const { params } = req;
  const { applicationId } = params;

  try {
    const cover = await api.getAutomaticCover();

    return res.render('partials/automatic-cover.njk', {
      terms: cover.items,
      applicationId,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateAutomaticCover = async (req, res) => {
  const { body, params } = req;
  const { applicationId } = params;

  try {
    const cover = {
      version: 123,
      items: [
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

    // await api.getAutomaticCover();

    const automaticCoverErrors = new AutomaticCoverErrors(body, cover.items);

    if (automaticCoverErrors.length > 0) {
      return res.render('partials/automatic-cover.njk', {
        errors: validationErrorHandler(automaticCoverErrors, 'automatic-cover'),
        terms: cover.items,
        selected: body,
        applicationId,
      });
    }

    // If form has at least 1 false, then redirect user to not eligible page
    if (fieldContainsAFalseBoolean(body)) {
      return res.redirect('ineligible-automatic-cover');
    }

    return res.redirect(`/gef/application-details/${applicationId}`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  automaticCover,
  validateAutomaticCover,
};
