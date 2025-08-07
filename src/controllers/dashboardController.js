const prisma = require('../db');

const renderDashboard = async (req,res) => {
    try {
        const folders = await prisma.folder.findMany({
            where: {
                userId: req.user.id,
                parentId: null,
            },
        });

        res.render('dashboard', {folders, files: []});
    } catch (error){
        console.error(error);
        req.flash('error_msg', 'Could not load dashboard.');
        res.redirect('/login');
    }
};

const createFolder = async (req, res) => {
    const {folderName, parentId} = req.body;
    try {
        await prisma.folder.create({
            data: {
                name: folderName,
                userId: req.user.id,
                parentId: parentId || null,
            },
        });
        req.flash('success_msg', 'folder created successfully');

        res.redirect(parentId ? `/folders/${parentId}` : '/dashboard');
    } catch (error){
        console.error(error);
        req.flash('error_msg', 'Could not create folder');
        res.redirect('back');
    }
};

const renderFolderContents = async (req,res) => {
    try{
        const folderId = req.params.id;
        const folder = await prisma.folder.findUnique({
            where: {id: folderId},
            include: {
                children: true,
                files: true,
            },
        });
        if(!folder || folder.userId !== req.user.id){
            req.flash('error_msg', 'Folder not found');
            return res.redirect('/dashboard');
        }
        res.render('folder', {folder});
    } catch(error){
        console.error(error);
        res.redirect('/dashboard');
    }
};

const uploadFile = async (req,res) => {
    const {folderId} = req.body;

    if(!req.file){
        req.flash('error_msg', 'Please select a file to upload');
        return res.redirect('back');
    }
    try {
        await prisma.file.create({
            data: {
                name: req.file.originalname,
                url: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype,
                userId: req.user.id,
                folderId: folderId,
            },
        });
        req.flash('success_msg', 'File uploaded successfully');
        res.redirect('/folders/${folderId}');
    } catch(error){
        console.error(error);
        req.flash('error_msg', 'Could not upload file');
        res.redirect(`/folders/${folderId}`);
    }
};

module.exports = {
    renderDashboard,
    createFolder,
    renderFolderContents,
    uploadFile,
};