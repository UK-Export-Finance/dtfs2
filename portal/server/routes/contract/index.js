import express from 'express';
import api from '../../api';
import aboutRoutes from './about';
import bondRoutes from './bond';
import eligibilityRoutes from './eligibility';
import loanRoutes from './loan';
import {
  requestParams,
  errorHref,
  postToApi,
  dealFormsCompleted,
} from '../../helpers';

import {
  provide, DEAL, MANDATORY_CRITERIA,
} from '../api-data-provider';

const router = express.Router();

router.get('/contract/:_id', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;
  const { user } = req.session;
  return res.render('contract/contract-view.njk', {
    deal,
    user,
    dealFormsCompleted: dealFormsCompleted(deal),
  });
});

router.get('/contract/:_id/comments', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

  return res.render('contract/contract-view-comments.njk', deal);
});

router.get('/contract/:_id/submission-details', provide([DEAL, MANDATORY_CRITERIA]), async (req, res) => {
  const { deal, mandatoryCriteria } = req.apiData;

  return res.render('contract/contract-submission-details.njk', {
    contract: deal,
    mandatoryCriteria,
  });
});

router.get('/contract/:_id/delete', async (req, res) => {
  const { _id } = req.params;

  return res.render('contract/contract-delete.njk', {
    contract: { _id },
  });
});

router.post('/contract/:_id/delete', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { comments } = req.body;

  const updateToSend = {
    _id,
    comments,
    status: 'Abandoned Deal',
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken);

  const validationErrors = {
    count: data.count,
    errorList: data.errorList,
  };

  if (validationErrors.count) {
    return res.status(400).render('contract/contract-delete.njk', {
      contract: { _id },
      comments,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract abandoned.',
    href: `/contract/${_id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View abandoned Supply Contract',
  });

  return res.redirect('/dashboard');
});

router.get('/contract/:_id/ready-for-review', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

  return res.render('contract/contract-ready-for-review.njk',
    {
      deal,
    });
});

router.post('/contract/:_id/ready-for-review', provide([DEAL]), async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { comments } = req.body;
  const { deal } = req.apiData;

  const updateToSend = {
    _id,
    comments,
    status: "Ready for Checker's approval",
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken);

  const validationErrors = {
    count: data.count,
    errorList: data.errorList,
  };
  if (validationErrors.count) {
    return res.status(400).render('contract/contract-ready-for-review.njk', {
      deal,
      comments,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract submitted for review.',
    href: `/contract/${_id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View Supply Contract',
  });

  return res.redirect('/dashboard');
});

router.get('/contract/:_id/edit-name', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

  return res.render('contract/contract-edit-name.njk', {
    contract: deal,
  });
});

router.post('/contract/:_id/edit-name', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { bankSupplyContractName } = req.body;

  const { data } = await api.updateDealName(_id, bankSupplyContractName, userToken);

  const validationErrors = {
    count: data.count,
    errorList: data.errorList,
  };
  if (validationErrors.count) {
    return res.status(400).render('contract/contract-edit-name.njk', {
      contract: { _id },
      bankSupplyContractName,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: `Supply Contract renamed: ${bankSupplyContractName}`,
    href: `/contract/${_id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View Supply Contract',
  });

  return res.redirect(`/contract/${_id}`);
});

router.get('/contract/:_id/return-to-maker', async (req, res) => {
  const { _id } = req.params;

  return res.render('contract/contract-return-to-maker.njk', { _id });
});

router.post('/contract/:_id/return-to-maker', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { comments } = req.body;

  const updateToSend = {
    _id,
    comments,
    status: "Further Maker's input required",
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken);

  const validationErrors = {
    count: data.count,
    errorList: data.errorList,
  };

  if (validationErrors.count) {
    return res.status(400).render('contract/contract-return-to-maker.njk', {
      _id,
      comments,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract returned to maker.',
    href: `/contract/${_id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View Supply Contract',
  });

  return res.redirect('/dashboard');
});

router.get('/contract/:_id/confirm-submission', async (req, res) => {
  const { _id } = req.params;

  return res.render('contract/contract-confirm-submission.njk', { _id });
});

router.post('/contract/:_id/confirm-submission', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { confirmSubmit } = req.body;

  const updateToSend = {
    _id,
    confirmSubmit,
    status: 'Submitted',
  };

  const { data } = await api.updateDealStatus(updateToSend, userToken);

  const validationErrors = {
    count: data.count,
    errorList: data.errorList,
  };

  if (validationErrors.count) {
    return res.status(400).render('contract/contract-confirm-submission.njk', {
      _id,
      confirmSubmit,
      validationErrors,
    });
  }

  req.flash('successMessage', {
    text: 'Supply Contract submitted to UKEF.',
    href: `/contract/${_id}`, // eslint-disable-line no-underscore-dangle
    hrefText: 'View Supply Contract',
  });

  return res.redirect('/dashboard');
});

router.get('/contract/:_id/clone', provide([DEAL]), async (req, res) => {
  const { deal } = req.apiData;

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

router.get('/contract/:_id/clone/before-you-start', provide([MANDATORY_CRITERIA]), async (req, res) => {
  const { mandatoryCriteria } = req.apiData;
  return res.render('before-you-start/before-you-start.njk', { mandatoryCriteria });
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
  loanRoutes,
  bondRoutes,
  eligibilityRoutes);

export default router;
