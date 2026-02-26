const express = require('express');
const router = express.Router();
const { applyReimbursement, getReimbursements, reviewReimbursement, deleteReimbursement } = require('../controllers/reimbursementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getReimbursements)
  .post(protect, applyReimbursement);

router.route('/:id')
  .delete(protect, deleteReimbursement);

router.route('/:id/review')
  .put(protect, authorize('manager', 'admin'), reviewReimbursement);

module.exports = router;
