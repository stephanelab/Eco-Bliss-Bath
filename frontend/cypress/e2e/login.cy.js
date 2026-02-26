describe("Login tests", () => {
  it("should login with correct credentials", () => {
    cy.fixture("user").then((user) =>
      cy.loginFront(user.username, user.password),
    );
    cy.getBySel("nav-link-cart").should("be.visible"); // Vérifier que le lien vers le panier soit visible, ce qui indique que la connexion a réussi
    cy.getBySel("nav-link-login").should("not.exist"); // Vérifier que le lien de connexion ne soit plus visible
    cy.getBySel("nav-link-logout").should("be.visible"); // Vérifier que le lien de déconnexion soit visible
  });
});
