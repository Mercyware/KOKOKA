const House = require('../models/House');
const Student = require('../models/Student');
const asyncHandler = require('express-async-handler');

// @desc    Get all houses
// @route   GET /api/houses
// @access  Private
exports.getHouses = asyncHandler(async (req, res) => {
  const filter = { school: req.school._id };

  const houses = await House.find(filter)
    .populate('houseHead', 'firstName lastName email')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: houses.length,
    data: houses
  });
});

// @desc    Get single house
// @route   GET /api/houses/:id
// @access  Private
exports.getHouse = asyncHandler(async (req, res) => {
  const house = await House.findOne({
    _id: req.params.id,
    school: req.school._id
  })
    .populate('houseHead', 'firstName lastName email');

  if (!house) {
    res.status(404);
    throw new Error('House not found');
  }

  // Get students in this house
  const students = await Student.find({
    house: house._id,
    school: req.school._id
  }).select('firstName lastName admissionNumber class');

  res.status(200).json({
    success: true,
    data: {
      ...house.toObject(),
      students
    }
  });
});

// @desc    Create new house
// @route   POST /api/houses
// @access  Private
exports.createHouse = asyncHandler(async (req, res) => {
  req.body.school = req.school._id;
  req.body.createdBy = req.user._id;

  const house = await House.create(req.body);

  res.status(201).json({
    success: true,
    data: house
  });
});

// @desc    Update house
// @route   PUT /api/houses/:id
// @access  Private
exports.updateHouse = asyncHandler(async (req, res) => {
  let house = await House.findOne({
    _id: req.params.id,
    school: req.school._id
  });

  if (!house) {
    res.status(404);
    throw new Error('House not found');
  }

  house = await House.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: house
  });
});

// @desc    Delete house
// @route   DELETE /api/houses/:id
// @access  Private
exports.deleteHouse = asyncHandler(async (req, res) => {
  const house = await House.findOne({
    _id: req.params.id,
    school: req.school._id
  });

  if (!house) {
    res.status(404);
    throw new Error('House not found');
  }

  // Check if there are students in this house
  const studentCount = await Student.countDocuments({ house: house._id });
  if (studentCount > 0) {
    res.status(400);
    throw new Error('Cannot delete house with students. Please reassign students first.');
  }

  await house.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
