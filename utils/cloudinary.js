const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'mrarthur',
    api_key: 285172745916438,
    api_secret: '23FmsJaQQMyF6hiqVTw7IMMdHac'
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