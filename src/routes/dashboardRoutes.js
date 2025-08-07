const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.use(isAuthenticated);

router.get('/dashboard', dashboardController.renderDashboard);

router.post('/folders', dashboardController.createFolder);

router.get('/folders/:id', dashboardController.renderFolderContents);

module.exports = router;