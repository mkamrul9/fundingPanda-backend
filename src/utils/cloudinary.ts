import { cloudinaryInstance } from '../config/cloudinary.config';
import streamifier from 'streamifier';

export const uploadToCloudinary = (
    fileBuffer: Buffer,
    folderName: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto'
): Promise<{ secure_url: string; public_id: string }> => {
    return new Promise((resolve, reject) => {
        // Create an upload stream to Cloudinary
        const uploadStream = cloudinaryInstance.uploader.upload_stream(
            {
                folder: `fundingpanda/${folderName}`,
                resource_type: resourceType as any,
            },
            (error: any, result: any) => {
                if (error) return reject(error);
                if (!result) return reject(new Error('No result from Cloudinary'));
                return resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        );

        // Convert the memory buffer into a readable stream and pipe it to Cloudinary
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};