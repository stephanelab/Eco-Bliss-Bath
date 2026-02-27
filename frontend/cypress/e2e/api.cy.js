import { fakerFR } from "@faker-js/faker";

describe("API tests without correct login", () => {
  it("should return an error 403 when trying to access the basket of a user without being authenticated", () => {
    cy.env(["apiUrl"]).then(({ apiUrl }) => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/orders`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });
  it("should return an error 401 when trying to login with wrong credentials", () => {
    cy.login("wronguser", "wrongpassword").then((response) => {
      expect(response.status).to.eq(401);
    });
  });
  it("should return the product specifications for a given product ID", function () {
    cy.env(["apiUrl"]).then(({ apiUrl }) => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/products/9`,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include.all.keys(
          "id",
          "name",
          "availableStock",
          "skin",
          "aromas",
          "ingredients",
          "description",
          "price",
          "picture",
          "varieties",
        );
        expect(response.body.id).to.eq(9);
      });
    });
  });
});

describe("API tests with correct login", () => {
  let token;

  before(() => {
    cy.fixture("user")
      .then((user) => cy.login(user.username, user.password))
      .then((response) => {
        cy.wrap(response).as("loginResponse");
        token = response.body.token;
        return cy.deleteBasket(token);
      });
  });

  it("should return a token when trying to login with correct credentials and a code 200", function () {
    cy.get("@loginResponse").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("token");
    });
  });

  it("should add an available products in the basket of the user", function () {
    cy.env(["apiUrl"]).then(({ apiUrl }) => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/orders/add`,
        headers: {
          Authorization: "Bearer " + token,
        },
        body: { product: 7, quantity: 1 },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("orderLines");
        const addedProduct = response.body.orderLines.find(
          (line) => line.product.id === 7,
        );
        expect(addedProduct).to.exist;
        expect(addedProduct.quantity).to.eq(1);
      });
    });
  });
  it("should not add an unavailable products in the basket of the user", function () {
    cy.env(["apiUrl"]).then(({ apiUrl }) => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/orders/add`,
        headers: {
          Authorization: "Bearer " + token,
        },
        failOnStatusCode: false,
        body: { product: 3, quantity: 1 },
      }).then((response) => {
        expect(response.status).not.to.eq(200);
        expect(response.status).not.to.eq(405); // 405 est le code de réponse retourné par l'API quand la méthode n'est pas autorisée (par exemple, PUT authorisé mais pas POST), on vérifie qu'on n'a pas ce code pour s'assurer que le test ne passe pas juste parce que la méthode POST n'est pas autorisée pour cet endpoint
      });
    });
  });
  it("should return the product list of the basket", function () {
    cy.env(["apiUrl"]).then(({ apiUrl }) => {
      cy.request({
        method: "GET",
        url: `${apiUrl}/orders`,
        headers: {
          Authorization: "Bearer " + token,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("orderLines");
        const addedProduct = response.body.orderLines.find(
          (line) => line.product.id === 7,
        );
        expect(addedProduct).to.exist;
        expect(addedProduct.quantity).to.eq(1);
      });
    });
  });
  it("should post a new opinion for a product", function () {
    const title = fakerFR.word.words(3);
    const comment = fakerFR.commerce.productDescription();
    const rating = fakerFR.number.int({ min: 1, max: 5 });
    cy.env(["apiUrl"]).then(({ apiUrl }) => {
      cy.request({
        method: "POST",
        url: `${apiUrl}/reviews`,
        headers: {
          Authorization: "Bearer " + token,
        },
        body: { title, comment, rating },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.title).to.eq(title);
        expect(response.body.comment).to.eq(comment);
        expect(response.body.rating).to.eq(rating);
      });
    });
  });
});
