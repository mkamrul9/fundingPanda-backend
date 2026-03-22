import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { MessageService } from './message.service';
import { uploadToCloudinary } from '../../utils/cloudinary';
import AppError from '../../errors/AppError';
import { TMessage } from './message.interface';

const getConversationHistory = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const otherUserId = req.params.otherUserId;
    if (process.env.DEBUG === 'true') {
        console.log(`API getConversationHistory: user=${userId} other=${otherUserId}`);
    }

    const result = await MessageService.getConversationHistoryFromDB(userId, otherUserId as string);
    if (process.env.DEBUG === 'true') {
        console.log(`Chat history count: ${result?.length ?? 0}`);
    }
    sendResponse(res, { statusCode: 200, success: true, message: 'Chat history retrieved', data: result });
});

const getConversations = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    if (process.env.DEBUG === 'true') {
        console.log(`API getConversations: user=${userId}`);
    }
    const result = await MessageService.getConversationsForUser(userId);
    if (process.env.DEBUG === 'true') {
        console.log(`Conversations count: ${result?.length ?? 0}`);
    }
    sendResponse(res, { statusCode: 200, success: true, message: 'Conversations retrieved', data: result });
});

const uploadChatImage = catchAsync(async (req: Request, res: Response) => {
    const senderId = req.user?.id as string;
    const body = req.body as TMessage;

    if (!req.file) throw new AppError(400, 'Please upload an image file');

    const uploadResult = await uploadToCloudinary(req.file.buffer, 'chat-images', 'image');

    const msg: TMessage = {
        senderId,
        receiverId: body.receiverId,
        imageUrl: uploadResult.secure_url,
    };

    const result = await MessageService.uploadChatImageInDB(msg);

    sendResponse(res, { statusCode: 201, success: true, message: 'Image sent in chat', data: result });
});

const sendTextMessage = catchAsync(async (req: Request, res: Response) => {
    const senderId = req.user?.id as string;
    const body = req.body as TMessage;

    if (!body.receiverId) {
        throw new AppError(400, 'Receiver ID is required');
    }

    if (!body.content?.trim()) {
        throw new AppError(400, 'Message content is required');
    }

    const msg: TMessage = {
        senderId,
        receiverId: body.receiverId,
        content: body.content,
    };

    const result = await MessageService.createTextMessageInDB(msg);
    sendResponse(res, { statusCode: 201, success: true, message: 'Message sent', data: result });
});

export const MessageController = { getConversationHistory, uploadChatImage, sendTextMessage, getConversations };