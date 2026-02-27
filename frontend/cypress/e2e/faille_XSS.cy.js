import { fakerFR } from "@faker-js/faker";

describe("XSS vulnerability test", () => {
  it("should not execute script in product opinion", () => {
    const title = fakerFR.word.words(3);
    const comment = "<script>alert('XSS');</script>";
    const rating = fakerFR.number.int({ min: 1, max: 5 });
    cy.intercept("POST", "**/login").as("POSTlogin");
    cy.loginFront();
    cy.wait("@POSTlogin").then(() => {
      cy.getBySel("nav-link-reviews").click();
      cy.getBySel("review-input-rating-images")
        .find("img")
        .eq(rating - 1)
        .click();
      cy.getBySel("review-input-title").type(title);
      cy.getBySel("review-input-comment").type(comment);
      cy.intercept("POST", "**/reviews").as("postReview");
      cy.getBySel("review-submit").click();
      cy.wait("@postReview");
      cy.on("window:alert", () => {
        throw new Error("Une fenêtre d'alerte s'est affichée !");
      });
    });
  });
});
