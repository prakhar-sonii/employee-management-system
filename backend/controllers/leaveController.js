const Leave = require('../models/Leave');
const User = require('../models/User');


const calculateDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let count = 0;
  const current = new Date(startDate);
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
};




const applyLeave = async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ message: 'End date must be after start date' });
  }

  try {
    const days = calculateDays(startDate, endDate);
    if (days === 0) {
      return res.status(400).json({ message: 'No working days in selected range' });
    }

    const user = await User.findById(req.user._id);
    if (user.leaveBalance[leaveType] < days) {
      return res.status(400).json({ message: `Insufficient ${leaveType} leave balance` });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
    });

    await leave.populate('employee', 'name email department');
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const getLeaves = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'employee' || req.query.mine === 'true') {
      
      query.employee = req.user._id;
    } else if (req.query.forApproval === 'true') {
      
      const targetRole = req.user.role === 'manager' ? 'employee' : 'manager';
      const eligibleUsers = await User.find({ role: targetRole }).select('_id');
      query.employee = { $in: eligibleUsers.map((u) => u._id) };
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'name email department role')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'name email department')
      .populate('reviewedBy', 'name');

    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    if (req.user.role === 'employee' && leave.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const reviewLeave = async (req, res) => {
  const { status, reviewNote } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  try {
    const leave = await Leave.findById(req.params.id).populate('employee');

    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave has already been reviewed' });
    }

    
    
    
    const requesterRole = leave.employee.role;
    if (req.user.role === 'manager' && requesterRole !== 'employee') {
      return res.status(403).json({ message: 'Managers can only approve employee leave requests' });
    }
    if (req.user.role === 'admin' && requesterRole !== 'manager') {
      return res.status(403).json({ message: 'Admins can only approve manager leave requests' });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewNote = reviewNote || '';
    leave.reviewedAt = new Date();
    await leave.save();

    
    if (status === 'approved') {
      await User.findByIdAndUpdate(leave.employee._id, {
        $inc: { [`leaveBalance.${leave.leaveType}`]: -leave.days },
      });
    }

    await leave.populate('employee', 'name email department');
    await leave.populate('reviewedBy', 'name');
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete a reviewed leave request' });
    }

    await leave.deleteOne();
    res.json({ message: 'Leave request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyLeave, getLeaves, getLeaveById, reviewLeave, deleteLeave };
