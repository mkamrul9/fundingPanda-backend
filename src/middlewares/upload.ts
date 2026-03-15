import multer from 'multer';
import AppError from '../errors/AppError';

// Hold the file in memory instead of writing to disk
const storage = multer.memoryStorage();

// Create the Multer instance with a 10MB file size limit
export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit for PDFs and Images
    },
    fileFilter: (req, file, cb) => {
        // Only allow specific file types
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError(400, 'Invalid file type. Only JPG, PNG, WEBP, PDF, and MP4 are allowed.'));
        }
    },
});