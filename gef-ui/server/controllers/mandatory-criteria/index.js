import _isEmpty from 'lodash/isEmpty'
import { getCriteria } from '../../models/mandatory-criteria'

export const getMandatoryCriteria = async function (req, res) {
  // const response = await getCriteria()
  return res.render('mandatory-criteria.njk', {
    criteria: '<strong>hello</strong>'
  });
}

export const validateMandatoryCriteria = async function (req, res) {
  const body = req.body
  const { mandatoryCriteria } = body
  const isEmpty = _isEmpty(mandatoryCriteria)

  if (isEmpty) {
    res.status(422).render('mandatory-criteria.njk', {
      validationErrorMessage: {
        text: 'Select an option'
      }
    })
  }
}
