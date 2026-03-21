import { Server, Socket } from 'socket.io';
import prisma from '../lib/prisma';
import { auth } from '../lib/auth';

type TSendMessagePayload = {
    receiverId: string;
    content?: string;
    imageUrl?: string;
    tempId?: string;
};

const initializeSocket = (io: Server) => {
    io.use(async (socket, next) => {
        try {
            const headersInit: Record<string, string> = {};
            for (const [key, value] of Object.entries(socket.handshake.headers)) {
                if (typeof value === 'string') headersInit[key] = value;
                else if (Array.isArray(value)) headersInit[key] = value.join(',');
                else if (value !== undefined) headersInit[key] = String(value);
            }

            // Debug: show whether handshake contains cookie/header info we expect
            try {
                if (process.env.DEBUG === 'true') {
                    console.log('Socket handshake headers keys:', Object.keys(socket.handshake.headers));
                    console.log('Socket cookie header present:', typeof socket.handshake.headers.cookie === 'string');
                }
            } catch (e) {
                console.warn('Error reading handshake headers for debug', e);
            }

            const session = await auth.api.getSession({ headers: headersInit });
            if (!session?.user?.id) {
                console.warn('Socket auth failed: no session.user.id found');
                return next(new Error('Unauthorized socket connection'));
            }

            socket.data.user = {
                id: session.user.id,
                role: session.user.role,
            };

            if (process.env.DEBUG === 'true') {
                console.log('Socket authenticated for user:', session.user.id);
            }

            return next();
        } catch {
            return next(new Error('Unauthorized socket connection'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.user?.id as string;
        socket.join(userId);
        if (process.env.DEBUG === 'true') {
            console.log(`A user connected: ${socket.id} (user: ${userId})`);
        }

        // Keep event for frontend compatibility, but enforce authenticated room binding.
        socket.on('join_own_room', () => {
            socket.join(userId);
            if (process.env.DEBUG === 'true') {
                console.log(`User ${userId} joined their personal room.`);
            }
        });

        socket.on('send_message', async (data: TSendMessagePayload) => {
            try {
                if (process.env.DEBUG === 'true') {
                    console.log(`send_message from ${userId} -> ${data?.receiverId}:`, { content: data?.content, imageUrl: data?.imageUrl });
                }

                if (!data?.receiverId) {
                    console.warn('send_message missing receiverId, ignoring.');
                    return;
                }

                const savedMessage = await prisma.message.create({
                    data: {
                        senderId: userId,
                        receiverId: data.receiverId,
                        content: data.content,
                        imageUrl: data.imageUrl,
                    },
                });

                if (process.env.DEBUG === 'true') {
                    console.log('Message saved to DB with id:', savedMessage.id);
                }

                // Attach the client temporary id (if provided) so the client can reconcile optimistic messages
                const emitted = Object.assign({}, savedMessage, { clientTempId: data.tempId ?? null });

                io.to(data.receiverId).emit('receive_message', emitted);
                io.to(userId).emit('receive_message', emitted);

            } catch (error) {
                console.error('Error saving/sending message:', error);
            }
        });

        socket.on('disconnect', () => {
            if (process.env.DEBUG === 'true') {
                console.log(`User disconnected: ${socket.id}`);
            }
        });
    });
};

export default initializeSocket;