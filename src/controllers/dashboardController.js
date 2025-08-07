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
    const { folderName, parentId } = req.body;
    try{
        await prisma.folder.create({
            data: {
                name: folderName,
                userId: req.user.id,
                parentId: parentId || null,
            },
        });
        req.flash('success_msg', 'folder created successfully');

        res.redirect(parentId ? '/folders/${parentId}' : '/dashboard');
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
                childer: true,
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

module.exports = {
    renderDashboard,
    createFolder,
    renderFolderContents,
};