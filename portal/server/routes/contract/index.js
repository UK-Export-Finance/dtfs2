import express from 'express';
import api from '../../api';
import aboutRoutes from './about';
import bondRoutes from './bond';
import eligibilityRoutes from './eligibility';
import loanRoutes from './loan';
import {
  getApiData,
  requestParams,
  errorHref,
  postToApi,
  dealFormsCompleted,
} from '../../helpers';

const router = express.Router();


router.get('/contract/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const deal = await getApiData(
    api.contract(_id, userToken),
    res,
  );

  return res.render('contract/contract-view.njk', {
    deal,
    user: req.session.user,
    dealFormsCompleted: dealFormsCompleted(deal),
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

  return res.render('contract/contract-delete.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
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
      contract: await getApiData(
        api.contract(_id, userToken),
        res,
      ),
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

router.get('/contract/:_id/ready-for-review', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-ready-for-review.njk',
    {
      deal: await getApiData(
        api.contract(_id, userToken),
        res,
      ),
    });
});

router.post('/contract/:_id/ready-for-review', async (req, res) => {
  const { _id, userToken } = requestParams(req);
  const { comments } = req.body;

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
      deal: await getApiData(
        api.contract(_id, userToken),
        res,
      ),
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

router.get('/contract/:_id/edit-name', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-edit-name.njk', {
    contract: await getApiData(
      api.contract(_id, userToken),
      res,
    ),
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
      contract: await getApiData(
        api.contract(_id, userToken),
        res,
      ),
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
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-return-to-maker.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
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
      contract: await getApiData(
        api.contract(_id, userToken),
        res,
      ),
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
  const { _id, userToken } = requestParams(req);

  return res.render('contract/contract-confirm-submission.njk',
    await getApiData(
      api.contract(_id, userToken),
      res,
    ));
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
      contract: await getApiData(
        api.contract(_id, userToken),
        res,
      ),
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
  loanRoutes,
  bondRoutes,
  eligibilityRoutes);

export default router;
