import express from 'express'
import { 
  renderNameApplication,
  // validateMandatoryCriteria
} from '../controllers/name-application'
import validateToken from './middleware/validate-token';

const router = express.Router()

router.use('/*', validateToken);

router.get('/name-application', (req, res) => renderNameApplication(req, res))
// router.post('/name-application', (req, res) => validateMandatoryCriteria(req, res))

export default router
