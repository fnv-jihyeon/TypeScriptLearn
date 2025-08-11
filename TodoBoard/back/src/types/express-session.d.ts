import "express-session";

declare module "express-session" {
  interface SessionData {
    views?: number;
    user?: {
      username: string;
      email: string;
    };
  }
}
