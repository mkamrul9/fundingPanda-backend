import { cloudinaryInstance } from '../config/cloudinary.config';
import streamifier from 'streamifier';
import path from 'path';

export const uploadToCloudinary = (
    fileBuffer: Buffer,
    folderName: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto',
    originalName?: string // optional original filename (helps for raw uploads)
): Promise<{ secure_url: string; public_id: string }> => {
    return new Promise((resolve, reject) => {
        const options: any = {
            folder: `fundingpanda/${folderName}`,
            // Cloudinary expects resource_type to be one of 'image'|'raw'|'video'
            resource_type: resourceType === 'auto' ? 'image' : resourceType,
        };

        // If it's a raw file (PDF), Cloudinary often requires the extension in the public_id
        if ((resourceType === 'raw' || resourceType === 'auto') && originalName && resourceType === 'raw') {
            const ext = path.extname(originalName);
            const uniqueSuffix = Math.random().toString(36).substring(2, 15);
            options.public_id = `${uniqueSuffix}${ext}`;
        }

        const uploadStream = cloudinaryInstance.uploader.upload_stream(
            options,
            (error: any, result: any) => {
                if (error) return reject(error);
                if (!result) return reject(new Error('No result from Cloudinary'));
                return resolve({ secure_url: result.secure_url, public_id: result.public_id });
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

// NEW: Utility to delete files from Cloudinary
export const deleteFromCloudinary = (publicId: string, resourceType: 'image' | 'raw' | 'auto' = 'image') => {
    const resolvedType = resourceType === 'auto' ? 'image' : resourceType;
    return new Promise((resolve, reject) => {
        cloudinaryInstance.uploader.destroy(publicId, { resource_type: resolvedType }, (error: any, result: any) => {
            if (error) return reject(error);
            return resolve(result);
        });
    });
};

// NEW: Helper to extract public_id from a Cloudinary URL
export const extractCloudinaryPublicId = (url: string, resourceType: 'image' | 'raw' | 'auto'): string => {
    const parts = url.split('/fundingpanda/');
    if (parts.length !== 2) return '';
    const pathWithExt = `fundingpanda/${parts[1]}`;

    const resolvedType = resourceType === 'auto' ? 'image' : resourceType;
    // Raw files need the extension in the public_id, images do not
    return resolvedType === 'raw' ? pathWithExt : pathWithExt.substring(0, pathWithExt.lastIndexOf('.')) || pathWithExt;
};