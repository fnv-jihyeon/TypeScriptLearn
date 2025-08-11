import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { setupSwagger } from "./docs/swagger";
import session from "express-session";

import "@/docs/schemas"; // API 스키마 정의

import authRoutes from "./routes/auth.routes";
import scheduleRoutes from "./routes/schedule.route";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    rolling: false,
    name: "sid",
    cookie: {
      maxAge: 1000 * 60 * 30, // 30분
      httpOnly: true,
      secure: false, // 개발 환경에서는 false로 설정
      sameSite: "lax",
    },
  })
);

setupSwagger(app);

// api 라우트 설정
app.use("/api/auth", authRoutes);
app.use("/api/schedule", scheduleRoutes);

app.get("/session-test", (req, res) => {
  if (!req.session.views) req.session.views = 1;
  else req.session.views++;
  res.send(`Views: ${req.session.views}`);
});

//테스트용 라우트
app.get("/ping", (_, res) => {
  res.send("pong");
});

export default app;
