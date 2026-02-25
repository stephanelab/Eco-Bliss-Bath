import { el } from "@faker-js/faker";

describe("Basket tests", () => {
  let nstock;
  const checkProductStock = (retries = 3) => {
    if (retries <= 0) {
      throw new Error("Stock jamais positif après plusieurs tentatives");
    }
    cy.visit("/");
    cy.intercept("GET", "**/products/*").as("getProduct");
    cy.getBySel("product-home-link").first().click();
    cy.wait("@getProduct");
    cy.getBySel("detail-product-stock")
      .should(($el) => {
        expect($el.text()).to.match(/\d/);
      })
      .invoke("text")
      .then((text) => {
        nstock = parseInt(text);
        if (nstock <= 0) {
          checkProductStock(retries - 1);
        } else {
          expect(nstock).to.be.greaterThan(0);
        }
      });
  };
  it("should have a good behaviour", () => {
    cy.visit("/");
    cy.getBySel("nav-link-login").click();
    cy.intercept("POST", "**/login").as("POSTlogin");
    cy.fixture("user").then((user) => {
      cy.getBySel("login-input-username").type(user.username);
      cy.getBySel("login-input-password").type(user.password);
      cy.getBySel("login-submit").click();
    });
    cy.wait("@POSTlogin")
      .its("response.body.token")
      .then((token) => {
        cy.deleteBasket(token);
      });
    checkProductStock(3);
    cy.url().then((url) => {
      cy.wrap(url).as("savedUrl");
    });
    cy.intercept("GET", "**/orders").as("getBasket");
    cy.getBySel("detail-product-add").click();
    cy.wait("@getBasket");
    cy.url().should("include", "/cart");
    cy.getBySel("cart-line").should("have.length", 1);
    cy.get("@savedUrl").then((savedUrl) => {
      cy.visit(savedUrl);
    });
    cy.getBySel("detail-product-stock")
      .should(($el) => {
        expect($el.text()).to.match(/\d/);
      })
      .invoke("text")
      .then((text) => {
        const nstocka = parseInt(text);
        expect(nstocka).to.eq(nstock - 1);
      });
  });
});
