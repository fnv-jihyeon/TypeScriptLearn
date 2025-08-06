import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { setupSwagger } from "./swagger";
import session from "express-session";

import authRoutes from "./routes/auth.routes";

dotenv.config();
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
setupSwagger(app);

// api 라우트 설정
app.use("/api/auth", authRoutes);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

//테스트용 라우트
app.get("/ping", (_, res) => {
  res.send("pong");
});

export default app;
