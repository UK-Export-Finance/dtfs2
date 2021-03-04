import express from 'express';
import loginController from '../../controllers/login';

const router = express.Router();

router.get('/', loginController.getLogin);

router.post('/', loginController.postLogin);

router.get('/logout', loginController.logout);

export default router;
