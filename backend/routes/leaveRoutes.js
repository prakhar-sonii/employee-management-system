const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, getLeaveById, reviewLeave, deleteLeave } = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getLeaves)
  .post(protect, applyLeave);

router.route('/:id')
  .get(protect, getLeaveById)
  .delete(protect, deleteLeave);

router.route('/:id/review')
  .put(protect, authorize('manager', 'admin'), reviewLeave);

module.exports = router;
