const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  context: {
    type: String
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true
  },
  metadata: {
    model: String,
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number,
    processingTime: Number
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  tags: [String],
  isArchived: {
    type: Boolean,
    default: false
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  conversationId: {
    type: String
  },
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  attachments: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
MessageSchema.index({ user: 1, createdAt: -1 });
MessageSchema.index({ conversationId: 1 });

// Virtual for message age
MessageSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Static method to get conversation thread
MessageSchema.statics.getConversationThread = async function(conversationId) {
  return await this.find({ conversationId })
    .sort({ createdAt: 1 })
    .populate('user', 'name email role');
};

// Static method to get recent conversations for a user
MessageSchema.statics.getRecentConversations = async function(userId, limit = 10) {
  // Get distinct conversation IDs for the user, sorted by most recent
  const conversations = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$conversationId', lastMessage: { $first: '$$ROOT' } } },
    { $sort: { 'lastMessage.createdAt': -1 } },
    { $limit: limit }
  ]);
  
  // For each conversation, get the first message to use as title
  const result = [];
  
  for (const conv of conversations) {
    if (!conv._id) continue;
    
    const firstMessage = await this.findOne({ conversationId: conv._id })
      .sort({ createdAt: 1 })
      .select('prompt createdAt');
    
    const messageCount = await this.countDocuments({ conversationId: conv._id });
    
    result.push({
      conversationId: conv._id,
      title: firstMessage ? firstMessage.prompt.substring(0, 50) : 'Untitled conversation',
      lastMessageDate: conv.lastMessage.createdAt,
      messageCount
    });
  }
  
  return result;
};

// Method to add feedback to a message
MessageSchema.methods.addFeedback = async function(rating, comment) {
  this.feedback = {
    rating,
    comment,
    submittedAt: new Date()
  };
  
  await this.save();
};

module.exports = mongoose.model('Message', MessageSchema);
