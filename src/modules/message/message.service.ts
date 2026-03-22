import prisma from '../../lib/prisma';
import { TMessage } from './message.interface';

const getConversationHistoryFromDB = async (userId: string, otherUserId: string) => {
    // Find all messages where these two users are the sender/receiver
    return await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
            ],
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                },
            },
            receiver: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: { createdAt: 'asc' }, // Oldest first, so the chat reads top-to-bottom
    });
};

// We don't need a createMessage service here because socket.ts handles it!
// But we DO need one for image uploads in the chat.
const uploadChatImageInDB = async (message: TMessage) => {
    return await prisma.message.create({
        data: {
            senderId: message.senderId,
            receiverId: message.receiverId,
            content: message.content ?? null,
            imageUrl: message.imageUrl ?? null,
        },
    });
};

const createTextMessageInDB = async (message: TMessage) => {
    return await prisma.message.create({
        data: {
            senderId: message.senderId,
            receiverId: message.receiverId,
            content: message.content?.trim() || null,
            imageUrl: null,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                },
            },
            receiver: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

// Return a list of conversation partners for the given user, with the last message
const getConversationsForUser = async (userId: string) => {
    const messages = await prisma.message.findMany({
        where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
        },
        orderBy: { createdAt: 'desc' },
        include: { sender: true, receiver: true },
    });

    // Map partnerId -> conversation summary (first occurrence is the latest because of ordering)
    const map = new Map<string, { id: string; name: string; role: string; lastMessage: string | null; lastMessageAt: Date }>();

    for (const m of messages) {
        const partner = m.senderId === userId ? m.receiver : m.sender;
        if (!map.has(partner.id)) {
            map.set(partner.id, {
                id: partner.id,
                name: partner.name,
                role: partner.role,
                lastMessage: m.content ?? m.imageUrl ?? null,
                lastMessageAt: m.createdAt,
            });
        }
    }

    return Array.from(map.values());
};

export const MessageService = { getConversationHistoryFromDB, uploadChatImageInDB, createTextMessageInDB, getConversationsForUser };