describe("Login tests", () => {
  it("should login with correct credentials", () => {
    cy.visit("/");
    cy.getBySel("nav-link-login").click();
    cy.fixture("user").then((user) => {
      cy.getBySel("login-input-username").type(user.username);
      cy.getBySel("login-input-password").type(user.password);
      cy.getBySel("login-submit").click();
    });
    cy.getBySel("nav-link-cart").should("be.visible");
    cy.getBySel("nav-link-login").should("not.exist");
    cy.getBySel("nav-link-logout").should("be.visible");
  });
});
