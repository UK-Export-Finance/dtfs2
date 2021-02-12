import express from 'express'
import { 
  getMandatoryCriteria,
  validateMandatoryCriteria
} from '../controllers/mandatory-criteria'
import validateToken from './middleware/validate-token';

const router = express.Router()

router.use('/*', validateToken)

router.get('/mandatory-criteria', (req, res) => getMandatoryCriteria(req, res))
router.post('/mandatory-criteria', (req, res) => validateMandatoryCriteria(req, res))

export default router
