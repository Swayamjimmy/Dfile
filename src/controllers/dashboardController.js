const prisma = require('../db');
const path = require('path');

// Renders the main dashboard view with root-level folders
const renderDashboard = async (req, res) => {
    try {
        const folders = await prisma.folder.findMany({
            where: {
                userId: req.user.id,
                parentId: null,
            },
        });
        res.render('dashboard', { folders, files: [] });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Could not load dashboard.');
        res.redirect('/login');
    }
};

// Creates a new folder
const createFolder = async (req, res) => {
    const { folderName, parentId } = req.body;
    try {
        await prisma.folder.create({
            data: {
                name: folderName,
                userId: req.user.id,
                parentId: parentId || null,
            },
        });
        req.flash('success_msg', 'Folder created successfully.');
        res.redirect(parentId ? `/folders/${parentId}` : '/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Could not create folder.');
        res.redirect('back');
    }
};


const renderFolderContents = async (req, res) => {
    try {
        const folderId = req.params.id;
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
            include: {
                children: true,
                files: true,
                sharedLinks: true,
            },
        });

        if (!folder || folder.userId !== req.user.id) {
            req.flash('error_msg', 'Folder not found or access denied.');
            return res.redirect('/dashboard');
        }

        // --- ADD THIS LINE ---
        // Create the base URL from the request object
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // --- UPDATE THIS LINE ---
        // Pass both 'folder' and the new 'baseUrl' to the template
        res.render('folder', { folder, baseUrl });

    } catch (error) {
        console.error(error);
        res.redirect('/dashboard');
    }
};

// Handles the file upload and saves metadata to the database
const uploadFile = async (req, res) => {
    const { folderId } = req.body;

    if (!req.file) {
        req.flash('error_msg', 'Please select a file to upload.');
        return res.redirect('back');
    }

    try {
        await prisma.file.create({
            data: {
                name: req.file.originalname,
                url: req.file.path, // This now contains the Cloudinary URL
                size: req.file.size,
                mimetype: req.file.mimetype,
                userId: req.user.id,
                folderId: folderId,
            },
        });
        req.flash('success_msg', 'File uploaded successfully.');
        res.redirect(`/folders/${folderId}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Could not upload file.');
        res.redirect(`/folders/${folderId}`);
    }
};

// Handles downloading a file by redirecting to a special cloud URL
const downloadFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await prisma.file.findUnique({
            where: { id: fileId },
        });

        // Security check remains the same
        if (!file || file.userId !== req.user.id) {
            req.flash('error_msg', 'File not found or access denied.');
            return res.redirect('/dashboard');
        }

        const cloudinaryUrl = file.url;

        // We need to split the URL to insert the download flag correctly.
        // The parts will be: [ 'http://res.cloudinary.com/.../image', '/v12345/folder/file.jpg' ]
        const urlParts = cloudinaryUrl.split('/upload/');

        // A small safety check to ensure the URL is in a format we expect
        if (urlParts.length !== 2) {
            req.flash('error_msg', 'Could not generate a valid download link.');
            return res.redirect('back');
        }

        // Rebuild the URL with the 'fl_attachment' flag inserted
        const downloadUrl = `${urlParts[0]}/upload/fl_attachment/${urlParts[1]}`;

        // Redirect to the new URL that forces a download
        res.redirect(downloadUrl);

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'An error occurred.');
        res.redirect('/dashboard');
    }
};
const createShareLink = async (req, res) => {
    const folderId = req.params.id;
    const { duration } = req.body; // e.g., '1d', '7d', '30d'

    try {
        // Security Check: Make sure the user owns the folder
        const folder = await prisma.folder.findUnique({ where: { id: folderId } });
        if (!folder || folder.userId !== req.user.id) {
            req.flash('error_msg', 'Folder not found or access denied.');
            return res.redirect('/dashboard');
        }

        // Calculate the expiration date
        const expirationDate = new Date();
        if (duration === '1d') {
            expirationDate.setDate(expirationDate.getDate() + 1);
        } else if (duration === '7d') {
            expirationDate.setDate(expirationDate.getDate() + 7);
        } else if (duration === '30d') {
            expirationDate.setDate(expirationDate.getDate() + 30);
        } else {
            req.flash('error_msg', 'Invalid duration specified.');
            return res.redirect('back');
        }

        // Create the share link record in the database
        await prisma.sharedLink.create({
            data: {
                folderId: folderId,
                expiresAt: expirationDate,
            },
        });

        req.flash('success_msg', 'Share link created successfully!');
        res.redirect(`/folders/${folderId}`);

    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Could not create share link.');
        res.redirect('back');
    }
};


module.exports = {
    renderDashboard,
    createFolder,
    renderFolderContents,
    uploadFile,
    downloadFile,
    createShareLink, // <-- ADD THIS
};