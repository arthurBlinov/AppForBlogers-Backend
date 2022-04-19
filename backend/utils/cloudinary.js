const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'mrarthur',
    api_key: here is my key,
    api_secret: 'here is my api_secret'
})

const cloudinaryUploadImg = async(fileToUpload) => {
    try {
        const data = await cloudinary.uploader.upload(fileToUpload, {
            resourse_type: 'auto'
        });
            return {
                url: data?.secure_url
            };
    } catch (error) {
        return error;
    }
}

module.exports = cloudinaryUploadImg;
