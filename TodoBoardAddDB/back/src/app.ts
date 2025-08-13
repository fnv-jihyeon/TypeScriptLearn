import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { setupSwagger } from "./docs/swagger";
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";

import "@/docs/schemas"; // API 스키마 정의

import authRoutes from "./routes/auth.routes";
import scheduleRoutes from "./routes/schedule.route";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const useRedis = process.env.USE_REDIS === "true" && !!process.env.REDIS_URL;

const origins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (isProduction && process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1); // Heroku 등에서 프록시를 신뢰하도록 설정
}

let store: session.Store | undefined;

if (useRedis) {
  const client = createClient({
    url: process.env.REDIS_URL, // 예: redis://127.0.0.1:6379
    disableOfflineQueue: true,
    socket: {
      // dev에선 재시도 폭주 방지, prod는 아래 체크리스트대로 완화
      reconnectStrategy: isProduction ? (r) => Math.min(200 * r, 2000) : () => 0,
    },
  });
  client.on("error", (e) => console.error("Redis error:", e.message));
  client
    .connect()
    .then(() => {
      store = new RedisStore({ client, prefix: "sess:" });
      console.log("Redis connected: session store enabled");
    })
    .catch(() => console.warn("Redis not available: falling back to MemoryStore"));
}

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS policy violation: Origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    store,
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    name: "sid",
    cookie: {
      maxAge: 1000 * 60 * 30, // 30분
      httpOnly: true,
      secure: isProduction, // 개발 환경에서는 false로 설정
      sameSite: isProduction ? "none" : "lax",
    },
  })
);

setupSwagger(app);

// api 라우트 설정
app.use("/api/auth", authRoutes);
app.use("/api/schedule", scheduleRoutes);

// 세션 테스트
app.get("/session-test", (req, res) => {
  // types/express-session.d.ts에서 views?: number 타입 보강 필요(아래 주석 참고)
  // declare module "express-session" { interface SessionData { views?: number } }
  req.session.views = (req.session.views ?? 0) + 1;
  res.send(`Views: ${req.session.views}`);
});

// ping 체크
app.get("/ping", (_, res) => {
  res.send("pong");
});

export default app;
