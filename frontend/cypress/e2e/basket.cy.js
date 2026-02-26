describe("Basket tests", () => {
  let nstock;
  let productId;

  // Fonction pour sélectionner un produit et vérifier que le stock du produit est positif, avec 3 tentatives en cas de stock inférieur ou égal à 0
  const checkProductStock = (retries = 3) => {
    if (retries <= 0) {
      throw new Error("Stock jamais positif après plusieurs tentatives");
    }
    cy.visit("/");
    cy.intercept("GET", "**/products/*").as("getProduct");
    cy.getBySel("product-home-link").first().click();
    cy.wait("@getProduct")
      .its("response.body")
      .then((product) => {
        productId = product.id;
      });
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
    //
    // Lancer la fonction pour sélectionner un produit et vérifier que le stock du produit est positif
    checkProductStock(3);
    // Récupérer l'URL du produit sélectionné pour pouvoir y revenir plus tard
    cy.url().then((url) => {
      cy.wrap(url).as("savedUrl");
    });
    // Cliquer sur le bouton "Ajouter au panier"
    cy.intercept("GET", "**/orders").as("getBasket");
    cy.getBySel("detail-product-add").click();
    cy.wait("@getBasket")
      // Vérifier que le produit ait été ajouté au panier en vérifiant que la réponse de l'API contienne une ligne de commande avec l'id du produit sélectionné etune quantité de 1
      .its("response.body.orderLines")
      .then((orderLines) => {
        const addedProduct = orderLines.find(
          (line) => line.product.id === productId && line.quantity === 1,
        );
        expect(addedProduct).to.exist;
      });
    // Vérifier que l'on soit redirigé vers la page du panier
    cy.url().should("include", "/cart");
    // Vérifier que le produit ait été ajouté au panier
    cy.getBySel("cart-line").should("have.length", 1);
    // Retour sur la page du produit en utilisant l'URL sauvegardé
    cy.get("@savedUrl").then((savedUrl) => {
      cy.visit(savedUrl);
    });
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
    cy.get("@savedUrl").then((savedUrl) => {
      cy.url().should("eq", savedUrl);
    });
    // Taper un chiffre supérieur à 20 dans le champ de quantité du produit
    cy.getBySel("detail-product-quantity").clear().type("50");
    // Vérifier qu'on ne puisse pas valider la modification de la quantité en vérifiant qu'on ne soit pas rediriger vers le panier
    cy.getBySel("detail-product-add").click();
    cy.wait(500); // Attendre un peu pour s'assurer que la redirection aurait eu le temps de se faire si elle devait se faire
    cy.get("@savedUrl").then((savedUrl) => {
      cy.url().should("eq", savedUrl);
    });
  });
});
