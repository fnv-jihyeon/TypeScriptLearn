import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { setupSwagger } from './swagger';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
setupSwagger(app);

//테스트용 라우트
app.get('/ping', (_, res) => {
  res.send('pong');
});

export default app;