import "express-session";
import type { userSession } from "@shared/types/user";

declare module "express-session" {
  interface SessionData {
    views?: number;
    user?: userSession;
  }
}
