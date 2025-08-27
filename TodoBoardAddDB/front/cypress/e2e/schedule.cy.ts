// describe("Schedule CRUD", () => {
//   before(() => {
//     // 사전 가입
//     const API = Cypress.env("API_URL");
//     const u = "demo";
//     cy.request("POST", `${API}/api/auth/signup`, { username: u, email: `${u}@t.com`, password: "secret12" })
//       .its("status")
//       .should("eq", 200);
//   });
describe("Schedule CRUD", () => {
  beforeEach(() => {
    // 완전 깨끗한 상태 보장
    cy.clearAllCookies();
    cy.request({
      method: "POST",
      url: `${Cypress.env("API_URL")}/api/auth/logout`,
      failOnStatusCode: false, // 비로그인 상태라 401/200 상관없이 통과
    });
  });

  before(() => {
    cy.loginByApi("demo", "secret12");
  });
  it("login via UI and create a schedule", () => {
    cy.visit("/auth/login");
    cy.location("pathname").should("eq", "/auth/login");

    cy.get('[data-cy="login-card"]', { timeout: 20000 }).should("be.visible");

    cy.get('[data-cy="username"] input').type("demo");
    cy.get('[data-cy="password"] input').type("secret12");
    cy.get('[data-cy="login-submit"]').click();

    cy.location("pathname", { timeout: 10000 }).should("eq", "/");

    cy.get("body").then(($b) => {
      cy.log($b.html()?.slice(0, 500));
    });

    // 로그인 후 스케줄 페이지로 이동했다고 가정
    cy.url().should("match", /schedules|dashboard/);

    // 새 일정 추가 폼
    cy.findByLabelText(/title/i).type("standup");
    // 시간 선택 UI에 따라 값 입력(예: input[type=time] 이라면):
    cy.findByLabelText(/start/i).type("09:00");
    cy.findByLabelText(/end/i).type("09:30");
    cy.findByLabelText(/color/i).type("#0af");
    cy.findByRole("button", { name: /create|add/i }).click();

    // 목록에 표시 확인
    cy.findByText("standup").should("exist");
  });
});
