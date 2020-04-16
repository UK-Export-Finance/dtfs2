const api = () => {
    const url = `${Cypress.config('apiProtocol')}${Cypress.config('apiHost')}:${Cypress.config('apiPort')}`;
    console.log(`url for api: ${url}`);
    return url;
}

module.exports.logIn = (opts) => {
  const { username, password } = opts;

  return cy.request({
    url: `${api()}/v1/login`,
    method: 'POST',
    body: {username, password},
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body.token;
  });
}


module.exports.deleteDeal = (token, deal) => {
  return cy.request({
    url: `${api()}/v1/deals/${deal._id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  }).then((resp) => {
    return expect(resp.status).to.equal(200);
  });
};

module.exports.listAllDeals = (token) => {
  return cy.request({
    url: `${api()}/v1/deals`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body.deals;
  });
};

module.exports.insertDeal = (deal, token) => {
  return cy.request({
    url: `${api()}/v1/deals`,
    method: 'POST',
    body: deal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });
}

module.exports.downloadFile = (token, deal) => {
  return cy.request({
    url: `${api()}/v1/deals/${deal._id}/integration/type-a`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
  }).then((resp) => {
    expect(resp.status).to.equal(200);
    return resp.body;
  });
}
