import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import 'dotenv/config';
import initializeSocket from './socket/socket'; // We will create this next!

let server: HttpServer;
const PORT = Number(process.env.PORT || 5000);
const frontendUrl = process.env.FRONTEND_URL;

if (process.env.NODE_ENV === 'production' && !frontendUrl) {
    throw new Error('FRONTEND_URL is required in production');
}

const socketAllowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
].filter((value): value is string => Boolean(value));

async function main() {
    try {
        // Wrap Express app in an HTTP server
        server = app.listen(PORT, () => {
            console.log(`Database connected and Server running on port ${PORT}`);
        });

        // Initialize Socket.io and attach it to the server
        const io = new SocketIOServer(server, {
            cors: {
                origin: socketAllowedOrigins,
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        // Pass the io instance to our custom socket handler
        initializeSocket(io);

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

main();
