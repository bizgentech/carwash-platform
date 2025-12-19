import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
}

/**
 * Upload a file to Cloudinary
 * @param fileBuffer - File buffer or base64 string
 * @param folder - Cloudinary folder path (e.g., 'washer-applications/documents')
 * @param resourceType - 'image', 'raw', or 'auto'
 * @returns Upload result with secure URL
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: resourceType === 'image'
          ? ['jpg', 'jpeg', 'png', 'gif', 'webp']
          : ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
            resource_type: result.resource_type,
            bytes: result.bytes,
          });
        } else {
          reject(new Error('Upload failed without error'));
        }
      }
    );

    if (typeof fileBuffer === 'string') {
      // If it's a base64 string
      uploadStream.end(Buffer.from(fileBuffer, 'base64'));
    } else {
      // If it's already a Buffer
      uploadStream.end(fileBuffer);
    }
  });
}

/**
 * Delete a file from Cloudinary
 * @param publicId - Cloudinary public ID
 * @param resourceType - 'image', 'raw', or 'auto'
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;
