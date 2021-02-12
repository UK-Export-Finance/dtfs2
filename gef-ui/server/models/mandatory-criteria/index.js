import Api from '../../services/api'

export async function getCriteria (token) {
  const api = new Api(token)

  const response = await api.getMandatoryCriteria()
  console.log('response', response)
  return reponse
}
