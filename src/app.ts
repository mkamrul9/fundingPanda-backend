import express, { Application } from 'express';
import cors from 'cors';
import router from './routes';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());

// Application Routes
app.use('/api/v1', router);


export default app;