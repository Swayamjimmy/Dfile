const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with the credentials from your .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary as the storage engine for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dfile', // The name of the folder in Cloudinary
        allowed_formats: ['jpeg', 'png', 'jpg', 'pdf', 'txt', 'doc', 'docx'], // Allowed file formats
        // A function to generate a unique public_id for each file
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // Returns a unique name like 'kashmir-box/file-1678886400000-123456789'
            return `dfile/${file.fieldname}-${uniqueSuffix}`;
        },
    },
});

// Create the multer instance with the new Cloudinary storage engine
const upload = multer({ storage: storage });

module.exports = upload;