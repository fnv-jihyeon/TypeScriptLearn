/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      loginByApi(username: string, password: string): Chainable<void>;
    }
  }
}
export {};

Cypress.Commands.add("loginByApi", (username: string, password: string) => {
  const API = Cypress.env("API_URL");
  cy.request("POST", `${API}/api/auth/login`, { username, password }).its("status").should("eq", 200);
});
