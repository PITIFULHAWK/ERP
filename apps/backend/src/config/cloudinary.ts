import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: "dxhwydnwz",
    api_key: "411564531389855",
    api_secret: "BWosWNXhCVrIzn82yr0XlSu77DY",
});

export default cloudinary;

// Helper function to upload buffer to Cloudinary
export const uploadToCloudinary = async (
    buffer: Buffer,
    fileName: string,
    folder: string = "erp-documents"
): Promise<{
    url: string;
    public_id: string;
    secure_url: string;
    bytes: number;
    format: string;
}> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder,
                    public_id: `${folder}/${Date.now()}-${fileName}`,
                    resource_type: "auto", // Automatically detect file type
                    quality: "auto", // Optimize quality
                    fetch_format: "auto", // Optimize format
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve(result);
                    } else {
                        reject(new Error("Upload failed"));
                    }
                }
            )
            .end(buffer);
    });
};

// Helper function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        throw error;
    }
};
