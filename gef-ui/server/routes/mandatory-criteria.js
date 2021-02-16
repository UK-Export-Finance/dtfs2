import express from 'express'
import { 
  getMandatoryCriteria,
  validateMandatoryCriteria
} from '../controllers/mandatory-criteria'
import validateToken from './middleware/validate-token'

const router = express.Router()

router.get('/mandatory-criteria', validateToken, (req, res) => getMandatoryCriteria(req, res))
router.post('/mandatory-criteria', validateToken, (req, res) => validateMandatoryCriteria(req, res))

export default router
