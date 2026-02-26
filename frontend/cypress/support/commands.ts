declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      deleteBasket(token: string): Chainable<void>;
      getBySel(selector: string): Chainable<JQuery<HTMLElement>>;
      loginFront(username: string, password: string): Chainable<void>;
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

Cypress.Commands.add('loginFront', (username: string, password: string) => {
  cy.visit('/'); // Aller sur la page d'accueil
  cy.getBySel('nav-link-login').click(); // Cliquer sur le lien  "Connexion"
  cy.fixture('user').then((user) => {
    cy.getBySel('login-input-username').type(user.username); // Taper le nom d'utilisateur
    cy.getBySel('login-input-password').type(user.password); // Taper le mot de passe
    cy.getBySel('login-submit').click(); // Cliquer sur le bouton de connexion
  });
});
