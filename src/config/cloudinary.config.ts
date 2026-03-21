import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

const requiredCloudinaryEnv = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] as const;
for (const envKey of requiredCloudinaryEnv) {
    if (!process.env[envKey]) {
        throw new Error(`Missing required environment variable: ${envKey}`);
    }
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryInstance = cloudinary;