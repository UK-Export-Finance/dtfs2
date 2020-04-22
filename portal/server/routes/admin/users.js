import express from 'express';
import api from '../../api';
import {
  getApiData,
  requestParams,
} from '../../helpers';

const router = express.Router();

router.get('/users', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const userList = await getApiData(
    api.users(userToken),
    res,
  );

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  return res.render('admin/dashboard.njk',
    {
      _id,
      users: userList.users,
      banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
      user: req.session.user,
    });
});

router.get('/users/create', async (req, res) => {
  const { userToken } = requestParams(req);

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  return res.render('admin/user-create.njk',
    {
      banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
      user: req.session.user,
    });
});

router.get('/users/edit/:_id', async (req, res) => {
  const { _id, userToken } = requestParams(req);

  const banks = await getApiData(
    api.banks(userToken),
    res,
  );

  return res.render('admin/user-create.njk',
    {
      _id,
      banks: banks.sort((bank1, bank2) => bank1.name < bank2.name),
    });
});

export default router;
