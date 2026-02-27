describe("Basket tests", () => {
  let nstock;
  let productId;

  // Fonction pour sélectionner un produit et vérifier que le stock du produit est positif, avec 3 tentatives en cas de stock inférieur ou égal à 0
  const checkProductStock = (retries = 3) => {
    if (retries <= 0) {
      throw new Error("Stock jamais positif après plusieurs tentatives");
    }
    cy.visit("/");
    cy.intercept("GET", "**/products/[0-9]*").as("getProduct");
    cy.getBySel("product-home-link").first().click();
    return cy
      .wait("@getProduct")
      .its("response.body")
      .then((product) => {
        productId = product.id;
        return cy
          .getBySel("detail-product-stock")
          .should(($el) => {
            expect($el.text()).to.match(/\d/);
          })
          .invoke("text")
          .then((text) => {
            nstock = parseInt(text);
            if (nstock <= 0) {
              return checkProductStock(retries - 1);
            }
            expect(nstock).to.be.greaterThan(0);
            return cy.wrap(productId);
          });
      });
  };

  beforeEach(() => {
    // Connecter l'utilisateur
    cy.intercept("POST", "**/login").as("POSTlogin");
    cy.fixture("user").then((user) =>
      cy.loginFront(user.username, user.password),
    );
    // Attendre que la connexion soit finie, récupèrer le token et vider le panier
    cy.wait("@POSTlogin")
      .its("response.body.token")
      .then((token) => {
        cy.deleteBasket(token);
      });
  });

  it("should not add an unavailable product in the basket", () => {
    // Naviguer sur une fiche produit dont le stock est <0
    cy.intercept("GET", "**/products/3").as("getProduct");
    cy.visit("/products/3");
    cy.wait("@getProduct")
      .its("response.body")
      .then((product) => {
        expect(product.availableStock).to.be.lessThan(1);
      });
    // Cliquer sur le bouton "Ajouter au panier"
    cy.intercept("GET", "**/orders").as("getBasket");
    cy.getBySel("detail-product-add").click();
    cy.wait("@getBasket")
      // Vérifier que le produit ait été ajouté au panier en vérifiant que la réponse de l'API contienne une ligne de commande avec l'id du produit sélectionné etune quantité de 1
      .its("response.body.orderLines")
      .then((orderLines) => {
        const addedProduct = orderLines.find(
          (OrderLine) => OrderLine.product.id === 3,
        );
        expect(addedProduct).to.not.exist;
      });
  });

  it("should have a good behaviour", () => {
    // Lancer la fonction pour sélectionner un produit et vérifier que le stock du produit est positif
    checkProductStock().then((productId) => {
      // Cliquer sur le bouton "Ajouter au panier"
      cy.intercept("GET", "**/orders").as("getBasket");
      cy.getBySel("detail-product-add").click();
      cy.wait("@getBasket")
        // Vérifier que le produit ait été ajouté au panier en vérifiant que la réponse de l'API contienne une ligne de commande avec l'id du produit sélectionné etune quantité de 1
        .its("response.body.orderLines")
        .then((orderLines) => {
          const addedProduct = orderLines.find(
            (OrderLine) =>
              OrderLine.product.id === Number(productId) &&
              OrderLine.quantity === 1,
          );
          expect(addedProduct).to.exist;
        });
      // Vérifier que l'on soit redirigé vers la page du panier
      cy.url().should("include", "/cart");
      // Vérifier que le produit ait été ajouté au panier
      cy.getBySel("cart-line").should("have.length", 1);
      // Retour sur la page du produit
      cy.visit(`/products/${productId}`);
      // Vérifier que le stock du produit ait été décrémenté de 1
      cy.getBySel("detail-product-stock")
        .should("exist") // Vérifier que le champ de disponibilité soit présent
        .should(($el) => {
          expect($el.text()).to.match(/\d/);
        })
        .invoke("text")
        .then((text) => {
          const nstocka = parseInt(text);
          expect(nstocka).to.eq(nstock - 1);
        });
      // Taper un chiffre négatif dans le champ de quantité du produit
      cy.getBySel("detail-product-quantity").clear().type("-1");
      // Vérifier qu'on ne puisse pas valider la modification de la quantité en vérifiant qu'on ne soit pas rediriger vers le panier
      cy.getBySel("detail-product-add").click();
      cy.wait(500); // Attendre un peu pour s'assurer que la redirection aurait eu le temps de se faire si elle devait se faire
      cy.url().should("include", `/products/${productId}`);
      // Taper un chiffre supérieur à 20 dans le champ de quantité du produit
      cy.getBySel("detail-product-quantity").clear().type("50");
      // Vérifier qu'on ne puisse pas valider la modification de la quantité en vérifiant qu'on ne soit pas rediriger vers le panier
      cy.getBySel("detail-product-add").click();
      cy.wait(500); // Attendre un peu pour s'assurer que la redirection aurait eu le temps de se faire si elle devait se faire
      cy.url().should("include", `/products/${productId}`);
    });
  });
});
