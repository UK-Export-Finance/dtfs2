import express from 'express'
// import dealRoutes from './deal';
import mandatoryCriteriaRoutes from './mandatory-criteria'

const router = express.Router()

router.use(mandatoryCriteriaRoutes)

export default router
