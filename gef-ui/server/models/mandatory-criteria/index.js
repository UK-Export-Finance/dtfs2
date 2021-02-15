import Api from '../../services/api'

const getCriteria = async (token) => {
  const api = new Api(token)

  try {
    const response = await api.getMandatoryCriteria()

    return response
  } catch (err) {
    throw err
  }
  
}

export {
  getCriteria
}
