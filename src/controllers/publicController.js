const prisma = require('../db');

const viewSharedFolder = async (req, res) => {
    try {
        const token = req.params.token;

        // Find the link by its unique token
        const sharedLink = await prisma.sharedLink.findUnique({
            where: { token: token },
            // Also include the folder data, its sub-folders, and its files in one query
            include: {
                folder: {
                    include: {
                        children: true,
                        files: true,
                    },
                },
            },
        });

        // VALIDATION: Check if the link exists and if it has expired
        if (!sharedLink || new Date(sharedLink.expiresAt) < new Date()) {
            // If the link is not found or has expired, render an error page
            return res.render('invalidLink');
        }

        // If the link is valid, render the shared folder page
        res.render('sharedFolder', { folder: sharedLink.folder });

    } catch (error) {
        console.error(error);
        res.render('invalidLink');
    }
};

module.exports = {
    viewSharedFolder,
};