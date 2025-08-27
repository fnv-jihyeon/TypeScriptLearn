const API = Cypress.env("API_URL");

describe("Auth flow", () => {
  it("signs up and checks session", () => {
    const u = `u${Date.now()}`;
    const body = { username: u, email: `${u}@test.com`, password: "secret12" };

    cy.request("POST", `${API}/api/auth/signup`, body).its("status").should("eq", 200);
    cy.request(`${API}/api/auth/session`)
      .its("body")
      .then((b) => {
        expect(b.success).to.be.true;
        expect(b.user?.username).to.eq(u);
      });
  });
});
