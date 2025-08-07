const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// This route does NOT have the 'isAuthenticated' middleware because we want it to be public
router.get('/share/:token', publicController.viewSharedFolder);

module.exports = router;