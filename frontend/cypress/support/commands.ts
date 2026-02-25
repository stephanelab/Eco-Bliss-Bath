declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      deleteBasket(token: string): Chainable<void>;
      getBySel(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.env(['apiUrl']).then(({ apiUrl }) => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      failOnStatusCode: false,
      body: {
        username,
        password,
      },
    }).then((response) => {
      window.localStorage.setItem('token', response.body.token); // à garder si besoin pour test frontend, sinon à supprimer
    });
  });
});

Cypress.Commands.add('deleteBasket', (token: string) => {
  cy.env(['apiUrl']).then(({ apiUrl }) => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/orders`,
      failOnStatusCode: false,
      headers: {
        Authorization: 'Bearer ' + token,
      },
    }).then((response) => {
      if (response.status !== 404) {
        cy.wrap(response.body.orderLines).each((line: any) => {
          cy.request({
            method: 'DELETE',
            url: `${apiUrl}/orders/${line.id}/delete`,
            headers: {
              Authorization: 'Bearer ' + token,
            },
          });
        });
      }
    });
  });
});

Cypress.Commands.add('getBySel', (selector) => {
  return cy.get(`[data-cy=${selector}]`);
});
