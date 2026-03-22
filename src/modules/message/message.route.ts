import { Router } from 'express';
import { MessageController } from './message.controller';
import checkAuth from '../../middlewares/checkAuth';
import { upload } from '../../middlewares/upload';
import parseFormData from '../../middlewares/parseFormData';
import validateRequest from '../../middlewares/validateRequest';
import { MessageValidation } from './message.validation';

const router = Router();

// Get list of conversation partners for the logged-in user
router.get('/conversations', checkAuth('STUDENT', 'SPONSOR', 'ADMIN'), MessageController.getConversations);

// Get past messages between the logged-in user and another user
router.get('/:otherUserId', checkAuth('STUDENT', 'SPONSOR', 'ADMIN'), MessageController.getConversationHistory);

router.post('/', checkAuth('STUDENT', 'SPONSOR', 'ADMIN'), MessageController.sendTextMessage);

// Send an image in the chat
router.post(
    '/upload-image',
    checkAuth('STUDENT', 'SPONSOR', 'ADMIN'),
    upload.single('image'),
    parseFormData,
    validateRequest(MessageValidation.uploadImageZodSchema),
    MessageController.uploadChatImage
);

export const MessageRoutes = router;