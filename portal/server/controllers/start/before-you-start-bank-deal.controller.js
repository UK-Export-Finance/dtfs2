import { constructPayload, errorHref, postToApi, requestParams } from '../../helpers';
import { MANDATORY_CRITERIA } from '../../routes/api-data-provider';
import api from '../../api';

export const getBeforeYouStartBankDealPage = async (req, res) => {
  res.render('before-you-start/before-you-start-bank-deal.njk', {
    user: req.session.user,
  });
};

export const postBeforeYouStartBankDealPage = async (req, res) => {
  const { userToken } = requestParams(req);

  const allowedFields = ['bankInternalRefName', 'additionalRefName'];
  const sanitizedBody = constructPayload(req.body, allowedFields);

  const newDeal = {
    ...sanitizedBody,
    mandatoryCriteria: req.apiData[MANDATORY_CRITERIA],
  };

  const apiResponse = await postToApi(api.createDeal(newDeal, userToken), errorHref);

  const { validationErrors } = apiResponse;

  if (validationErrors) {
    const { bankInternalRefName, additionalRefName } = req.body;

    return res.status(400).render('before-you-start/before-you-start-bank-deal.njk', {
      bankInternalRefName,
      additionalRefName,
      validationErrors,
      user: req.session.user,
    });
  }

  return res.redirect(`/contract/${apiResponse._id}`);
};
