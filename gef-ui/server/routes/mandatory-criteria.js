import express from 'express'
import { 
  getMandatoryCriteria,
  // validateMandatoryCriteria
} from '../controllers/mandatory-criteria'

const router = express.Router()

router.get('/mandatory-criteria', (req, res) => getMandatoryCriteria(req, res))
// router.post('/mandatory-criteria', (req, res) => validateMandatoryCriteria(req, res))

export default router
