import express, { Application } from 'express';
import cors from 'cors';
import router from './routes';
import globalErrorHandler from './middlewares/globalErrorHandler';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());

// Application Routes
app.use('/api/v1', router);


// ... after routes
app.use(globalErrorHandler);

export default app;