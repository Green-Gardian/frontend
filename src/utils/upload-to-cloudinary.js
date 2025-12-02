export async function uploadToCloudinary(imageFile) {
   const CLOUD_NAME = 'dhzecuia4'; 
  const UPLOAD_PRESET = 'my_unsigned_preset'; 

  if (!imageFile) {
    throw new Error('No image file provided');
  }

  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Upload failed: No secure_url returned');
    }

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}



