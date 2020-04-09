import express from 'express';
import api from '../../api';
import aboutRoutes from './about';
import bondRoutes from './bond';
import eligibilityRoutes from './eligibility';
import {
  getApiData,
  requestParams,
  errorHref,
  postToApi,
} from '../../helpers';

const router = express.Router();

//TODO once we need to validate whether a deal can be Submitted
// this will need to get a lot more sophisticated...
const shouldDisplayOptions = (deal) => {
  const dontDisplay = [
    "Submitted",
    "Rejected by UKEF",
  ];

  return !dontDisplay.includes(deal.details.status);
}

const shouldDisplayAbandon = (deal) => {
  const display = [
    "Draft",
    "Further Maker's input required",
    "Abandoned Deal",
    "Acknowledged by UKEF",
    "Accepted by UKEF (without conditions)",
    "Accepted by UKEF (with conditions)",
    "Ready for Checker's approval",
  ];

  return display.includes(deal.details.status);

}
const shouldDisplayProceedToReview = (deal) => {
  return true;
}

const shouldDisplayProceedToSubmit = (deal) => {
  return false;
}

const shouldDisplayReturnToMaker = (deal) => {
  return false;
}

const disableAbandon = (deal) => {
  const disable = [
    "Abandoned Deal",
    "Acknowledged by UKEF",
    "Accepted by UKEF (without conditions)",
    "Accepted by UKEF (with conditions)",
    "Ready for Checker's approval",
  ];

  return disable.includes(deal.details.status);
};

const disableProceedToReview = (deal) => {
  const statusesThatCanSubmitForReview = [
    "Draft",
    "Further Maker's input required",
    "Accepted by UKEF (without conditions)",
    "Accepted by UKEF (with conditions)",
  ];

  return !statusesThatCanSubmitForReview.includes(deal.details.status);
};

const disableProceedToSubmit = (deal) => {
  return true;
};

const disableReturnToMaker = (deal) => {
  return true;
};
// /TODO

router.get('/contract/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const contract = await getApiData(
    api.contract(_id, userToken),
    res,
  )

  //TODO - we probably need to re-plumb the page to accept 2 objects
  // rather than munge the user in amongst the rest of the data..
  const user = req.session.user;
  return res.render('contract/contract-view.njk',{
    ...contract,
    user,
    shouldDisplayOptions: shouldDisplayOptions(contract),

    shouldDisplayAbandon: shouldDisplayAbandon(contract),
    disableAbandon: disableAbandon(contract),

    shouldDisplayProceedToReview: shouldDisplayProceedToReview(contract),
    disableProceedToReview: disableProceedToReview(contract),

    shouldDisplayProceedToSubmit: shouldDisplayProceedToSubmit(contract),
    disableProceedToSubmit: disableProceedToSubmit(contract),

    shouldDisplayReturnToMaker: shouldDisplayReturnToMaker(contract),
    disableReturnToMaker: disableReturnToMaker(contract),
  });
});

router.get('/contract/:_id/comments', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-view-comments.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/submission-details', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-submission-details.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
    mandatoryCriteria: await getApiData(
      api.mandatoryCriteria(userToken),
      res,
    ),
  });
});

router.get('/contract/:_id/delete', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-delete.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/ready-for-review', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-ready-for-review.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/edit-name', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-edit-name.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.post('/contract/:_id/edit-name', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { bankSupplyContractName } = req.body;

  const updateToApply = {
    _id,
    details: {
      bankSupplyContractName,
    },
  };

  await api.updateDeal(updateToApply, userToken);

  return res.redirect(`/contract/${_id}`);
});

router.get('/contract/:_id/return-to-maker', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-return-to-maker.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/confirm-submission', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-confirm-submission.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
});

router.get('/contract/:_id/clone', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  const {
    bankSupplyContractID,
    bankSupplyContractName,
  } = deal.details;

  return res.render('contract/contract-clone.njk', {
    bankSupplyContractID,
    bankSupplyContractName,
  });
});

router.post('/contract/:_id/clone', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const apiResponse = await postToApi(
    api.cloneDeal(_id, req.body, userToken),
    errorHref,
  );

  const {
    validationErrors,
    details,
  } = apiResponse;

  const {
    bankSupplyContractID,
    bankSupplyContractName,
  } = details;

  if (validationErrors) {
    return res.status(400).render('contract/contract-clone.njk', {
      bankSupplyContractID,
      bankSupplyContractName,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract cloned successfully. We have cleared some values to ensure data quality. Please complete.',
    href: `/contract/${apiResponse._id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View cloned Supply Contract',
  });

  return res.redirect('/dashboard');
});

router.get('/contract/:_id/clone/before-you-start', async (req, res) => {
  const { userToken } = requestParams(req);

  return res.render('before-you-start/before-you-start.njk', {
    mandatoryCriteria: await getApiData(
      api.mandatoryCriteria(userToken),
      res,
    ),
  });
});

router.post('/contract/:_id/clone/before-you-start', async (req, res) => {
  const { _id } = requestParams(req);
  const { criteriaMet } = req.body;

  if (criteriaMet === 'true') {
    return res.redirect(`/contract/${_id}/clone`);
  }
  return res.redirect('/unable-to-proceed');
});

router.use('/',
  aboutRoutes,
  bondRoutes,
  eligibilityRoutes);

export default router;
