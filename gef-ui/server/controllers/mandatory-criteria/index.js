import _isEmpty from 'lodash/isEmpty'
import * as Criteria from '../../models/mandatory-criteria'
import { parseBool, userToken, errorHandler } from '../../utils/helpers'

const getMandatoryCriteria = async function (req, res) {
  try {
    const criteria = await Criteria.getCriteria(userToken(req))

    return res.render('templates/mandatory-criteria.njk', {
      criteria
    })
  } catch (err) {
    const { status, message } = errorHandler(err)
    return res.status(status).render('templates/mandatory-criteria.njk', {
      error: message
    })
  }
}

const validateMandatoryCriteria = async function (req, res) {
  const body = req.body
  const { mandatoryCriteria } = body
  const isEmpty = _isEmpty(mandatoryCriteria)
  const criteria = await Criteria.getCriteria(userToken(req))
  
  if (isEmpty) {
    return res.status(422).render('templates/mandatory-criteria.njk', {
      validationErrorMessage: 'Select an option',
      criteria
    })
  }

  if (parseBool(mandatoryCriteria)) {
    return res.redirect('name-application');
  }

  return res.render('templates/mandatory-criteria.njk', {
    criteria
  })
}

export {
  getMandatoryCriteria,
  validateMandatoryCriteria
}
