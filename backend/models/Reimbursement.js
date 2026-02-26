const mongoose = require('mongoose');

const reimbursementSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be positive'],
  },
  category: {
    type: String,
    enum: ['travel', 'food', 'accommodation', 'equipment', 'medical', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewNote: {
    type: String,
  },
  reviewedAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Reimbursement', reimbursementSchema);
