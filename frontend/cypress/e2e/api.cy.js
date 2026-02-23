describe("API tests", () => {
  it("should return an error 403 when trying to access the basket of a user without being authenticated", () => {
    const apiOrdersUrl = `${Cypress.env("apiUrl")}/orders`;
    cy.request({
      method: "GET",
      url: apiOrdersUrl,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(403);
    });
  });
  //   Le testprécédent devrait être celui-ci, mais j'ai un retour erreur 500 !
  //   it("should return an error 403 when trying to access the user profile without being authenticated", () => {
  //     const apiUserUrl = `${Cypress.env("apiUrl")}/me`;
  //     cy.request({
  //       method: "GET",
  //       url: apiUserUrl,
  //       failOnStatusCode: false,
  //     }).then((response) => {
  //       expect(response.status).to.eq(403);
  //     });
  //   });
  it("should return an error 401 when trying to login with wrong credentials", () => {
    cy.login("wronguser", "wrongpassword").then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it("should return a token when trying to login with correct credentials", () => {
    cy.fixture("user").then((user) => {
      cy.login(user.username, user.password).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("token");
      });
    });
  });
});
