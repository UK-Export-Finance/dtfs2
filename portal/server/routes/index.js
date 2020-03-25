import express from 'express';
import startRoutes from './start';
import loginRoutes from './login';
import dashboardRoutes from './dashboard';
import contractRoutes from './contract';

const router = express.Router();

router.use('/', startRoutes);
router.use('/', loginRoutes);
router.use('/', dashboardRoutes);
router.use('/', contractRoutes);

router.get('/feedback', (req, res) => res.render('feedback.njk'));
router.get('/contact-us', (req, res) => res.render('contact.njk'));

export default router;
