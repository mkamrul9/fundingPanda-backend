import app from './app';
import "dotenv/config";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

bootstrap();