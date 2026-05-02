const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, requestController.getRequests);
router.post('/', protect, requestController.createRequest);
router.get('/all', protect, admin, requestController.getAllRequests);
router.put('/:id/respond', protect, admin, requestController.respondToRequest);
router.put('/:id/status', protect, admin, requestController.updateRequestStatus);

module.exports = router;
