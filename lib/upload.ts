import { supabase } from './supabase';

/**
 * Upload a base64 image to Supabase Storage
 * @param base64Image - Base64 encoded image string (with data:image/... prefix)
 * @param folder - Storage folder (e.g., 'products', 'stores')
 * @returns Public URL of uploaded image
 */
export async function uploadBase64Image(
    base64Image: string,
    folder: string = 'products'
): Promise<string> {
    try {
        // Extract file type and base64 data
        const matches = base64Image.match(/^data:image\/([a-zA-Z]*);base64,(.*)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 image format');
        }

        const fileType = matches[1]; // e.g., 'jpeg', 'png'
        const base64Data = matches[2];

        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${fileType}` });

        // Generate unique filename
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileType}`;
        const filePath = `${folder}/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('product-images') // Make sure this bucket exists
            .upload(filePath, blob, {
                contentType: `image/${fileType}`,
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

/**
 * Upload multiple base64 images
 * @param base64Images - Array of base64 encoded images
 * @param folder - Storage folder
 * @returns Array of public URLs
 */
export async function uploadMultipleImages(
    base64Images: string[],
    folder: string = 'products'
): Promise<string[]> {
    const uploadPromises = base64Images.map((img) =>
        uploadBase64Image(img, folder)
    );
    return Promise.all(uploadPromises);
}

/**
 * Delete image from Supabase Storage
 * @param imageUrl - Public URL of the image
 */
export async function deleteImage(imageUrl: string): Promise<void> {
    try {
        // Extract file path from public URL
        const urlParts = imageUrl.split('/product-images/');
        if (urlParts.length < 2) {
            throw new Error('Invalid image URL');
        }
        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from('product-images')
            .remove([filePath]);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}
