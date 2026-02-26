describe("Smoke tests", () => {
  it("should have the presence of connection field and button", () => {
    cy.visit("/");
    cy.getBySel("nav-link-login").should("be.visible");
    cy.getBySel("nav-link-login").click();
    cy.getBySel("login-input-username").should("be.visible");
    cy.getBySel("login-input-password").should("be.visible");
    cy.getBySel("login-submit").should("be.visible");
  });
  it("should have the presence of button to add product in the card when logged in", () => {
    cy.fixture("user").then((user) =>
      cy.loginFront(user.username, user.password),
    );
    cy.getBySel("product-home-link").first().click();
    cy.getBySel("detail-product-add").should("be.visible");
  });
});
