import _isEmpty from 'lodash/isEmpty'
import { getCriteria } from '../../models/mandatory-criteria'
import { parseBool } from '../../utils/helpers'

export const getMandatoryCriteria = async function (req, res) {
  // const response = await getCriteria()
  return res.render('templates/mandatory-criteria.njk', {
    criteria: '<strong>hello</strong>'
  });
}

export const validateMandatoryCriteria = async function (req, res) {
  const body = req.body
  const { mandatoryCriteria } = body
  const isEmpty = _isEmpty(mandatoryCriteria)
  if (isEmpty) {
    return res.status(422).render('templates/mandatory-criteria.njk', {
      validationErrorMessage: {
        text: 'Select an option'
      }
    })
  }

  if (parseBool(mandatoryCriteria)) {
    return res.redirect('name-application');
  }

  return res.render('templates/mandatory-criteria.njk')
}
