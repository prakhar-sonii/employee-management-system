const Reimbursement = require('../models/Reimbursement');




const applyReimbursement = async (req, res) => {
  const { amount, category, description } = req.body;

  if (!amount || !category || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }

  try {
    const reimbursement = await Reimbursement.create({
      employee: req.user._id,
      amount: Number(amount),
      category,
      description,
    });

    await reimbursement.populate('employee', 'name email department');
    res.status(201).json(reimbursement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const getReimbursements = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'employee' || req.query.mine === 'true') {
      
      query.employee = req.user._id;
    } else if (req.query.forApproval === 'true') {
      
      const User = require('../models/User');
      const targetRole = req.user.role === 'manager' ? 'employee' : 'manager';
      const eligibleUsers = await User.find({ role: targetRole }).select('_id');
      query.employee = { $in: eligibleUsers.map((u) => u._id) };
    }

    const reimbursements = await Reimbursement.find(query)
      .populate('employee', 'name email department role')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(reimbursements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const reviewReimbursement = async (req, res) => {
  const { status, reviewNote } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  try {
    const reimbursement = await Reimbursement.findById(req.params.id).populate('employee');

    if (!reimbursement) return res.status(404).json({ message: 'Reimbursement not found' });
    if (reimbursement.status !== 'pending') {
      return res.status(400).json({ message: 'Reimbursement has already been reviewed' });
    }

    
    
    
    const requesterRole = reimbursement.employee.role;
    if (req.user.role === 'manager' && requesterRole !== 'employee') {
      return res.status(403).json({ message: 'Managers can only approve employee reimbursement requests' });
    }
    if (req.user.role === 'admin' && requesterRole !== 'manager') {
      return res.status(403).json({ message: 'Admins can only approve manager reimbursement requests' });
    }

    reimbursement.status = status;
    reimbursement.reviewedBy = req.user._id;
    reimbursement.reviewNote = reviewNote || '';
    reimbursement.reviewedAt = new Date();
    await reimbursement.save();

    await reimbursement.populate('employee', 'name email department');
    await reimbursement.populate('reviewedBy', 'name');
    res.json(reimbursement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const deleteReimbursement = async (req, res) => {
  try {
    const reimbursement = await Reimbursement.findById(req.params.id);
    if (!reimbursement) return res.status(404).json({ message: 'Reimbursement not found' });

    if (reimbursement.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (reimbursement.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete a reviewed request' });
    }

    await reimbursement.deleteOne();
    res.json({ message: 'Reimbursement request deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyReimbursement, getReimbursements, reviewReimbursement, deleteReimbursement };
