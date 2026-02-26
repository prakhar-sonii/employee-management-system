const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, updateUserDepartment, deleteUser } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/department', updateUserDepartment);
router.delete('/users/:id', deleteUser);

module.exports = router;
