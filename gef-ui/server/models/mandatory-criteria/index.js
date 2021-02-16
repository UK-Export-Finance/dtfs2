import * as Api from '../../services/api'

const getCriteria = async () => {
  try {
    const response = await Api.getMandatoryCriteria()

    return response
  } catch (err) {
    throw err
  }
}

export {
  getCriteria
}
