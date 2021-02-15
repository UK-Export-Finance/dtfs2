import Api from '../../services/api'

const validateToken = async (req, res, next) => {
  const { userToken } = req.session
  const api = new Api(userToken)

  if (userToken && await api.getMandatoryCriteria()) {
    return next()
  }

  req.session.destroy(() => {
    res.redirect('/');
  })
}

export default validateToken
