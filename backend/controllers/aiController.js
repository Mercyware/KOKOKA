const Message = require('../models/Message');
const aiService = require('../services/aiService');

// Generate AI response
exports.generateResponse = async (req, res) => {
  try {
    const { prompt, context, userId, role } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }
    
    // Generate AI response using the AI service
    const response = await aiService.generateResponse(prompt, context, role);
    
    // Save the conversation
    const message = new Message({
      user: userId,
      prompt,
      response,
      context,
      role
    });
    
    await message.save();
    
    res.json({
      success: true,
      response,
      messageId: message._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get conversation history
exports.getConversationHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const messages = await Message.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate study materials
exports.generateStudyMaterials = async (req, res) => {
  try {
    const { subject, topic, grade, format } = req.body;
    
    if (!subject || !topic) {
      return res.status(400).json({ 
        message: 'Subject and topic are required' 
      });
    }
    
    const materials = await aiService.generateStudyMaterials(
      subject,
      topic,
      grade,
      format
    );
    
    res.json({
      success: true,
      materials
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate quiz questions
exports.generateQuizQuestions = async (req, res) => {
  try {
    const { subject, topic, difficulty, count } = req.body;
    
    if (!subject || !topic) {
      return res.status(400).json({ 
        message: 'Subject and topic are required' 
      });
    }
    
    const questions = await aiService.generateQuizQuestions(
      subject,
      topic,
      difficulty || 'medium',
      count || 5
    );
    
    res.json({
      success: true,
      questions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Grade essay or long-form answer
exports.gradeEssay = async (req, res) => {
  try {
    const { essay, rubric, subject, grade } = req.body;
    
    if (!essay) {
      return res.status(400).json({ message: 'Essay text is required' });
    }
    
    const feedback = await aiService.gradeEssay(
      essay,
      rubric,
      subject,
      grade
    );
    
    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate personalized learning plan
exports.generateLearningPlan = async (req, res) => {
  try {
    const { studentId, subject, goals, timeframe, currentLevel } = req.body;
    
    if (!studentId || !subject || !goals) {
      return res.status(400).json({ 
        message: 'Student ID, subject, and goals are required' 
      });
    }
    
    const learningPlan = await aiService.generateLearningPlan(
      studentId,
      subject,
      goals,
      timeframe || '3 months',
      currentLevel
    );
    
    res.json({
      success: true,
      learningPlan
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Analyze student performance
exports.analyzePerformance = async (req, res) => {
  try {
    const { studentId, subjects, timeframe } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    
    const analysis = await aiService.analyzeStudentPerformance(
      studentId,
      subjects,
      timeframe
    );
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
