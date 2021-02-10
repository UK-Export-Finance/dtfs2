import _isEmpty from 'lodash/isEmpty'
import { parseBool } from '../../utils/helpers'

export const renderNameApplication = async function (req, res) {
  return res.render('templates/name-application.njk');
}
