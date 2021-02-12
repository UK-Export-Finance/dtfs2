import Api from '../../services/api'

const getCriteria = async (token) => {
  const api = new Api(token)

  const response = await api.getMandatoryCriteria()
  return response
}

export {
  getCriteria
}
