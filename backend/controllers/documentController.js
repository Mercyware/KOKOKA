const Document = require('../models/Document');
const Student = require('../models/Student');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads', req.school._id.toString());
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'video/mp4', 'video/mpeg', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/ogg'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10 // Maximum 10 files per upload
  }
});

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private (All authenticated users)
exports.uploadDocument = [
  upload.array('files', 10),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const {
      title,
      type,
      category,
      subcategory,
      description,
      tags,
      isPublic,
      accessPermissions,
      relatedTo,
      studentId,
      expiresAt
    } = req.body;

    const uploadedDocuments = [];

    for (const file of req.files) {
      try {
        // Calculate file checksum
        const fileBuffer = await fs.readFile(file.path);
        const checksum = crypto.createHash('md5').update(fileBuffer).digest('hex');

        // Parse permissions
        let parsedPermissions = {};
        if (accessPermissions) {
          try {
            parsedPermissions = JSON.parse(accessPermissions);
          } catch (e) {
            parsedPermissions = {};
          }
        }

        // Parse related entity
        let parsedRelatedTo = {};
        if (relatedTo) {
          try {
            parsedRelatedTo = JSON.parse(relatedTo);
          } catch (e) {
            parsedRelatedTo = {};
          }
        }

        // Create document record
        const documentData = {
          school: req.school._id,
          title: title || path.basename(file.originalname, path.extname(file.originalname)),
          fileName: file.filename,
          originalName: file.originalname,
          filePath: path.relative(path.join(__dirname, '../uploads'), file.path),
          fileUrl: `/uploads/${req.school._id}/${file.filename}`,
          fileType: path.extname(file.originalname).substring(1).toUpperCase(),
          mimeType: file.mimetype,
          fileExtension: path.extname(file.originalname).substring(1).toUpperCase(),
          fileSize: file.size,
          type: type || 'other',
          category: category || 'other',
          subcategory,
          description,
          tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
          uploadedBy: req.user.id,
          isPublic: isPublic === 'true',
          accessPermissions: parsedPermissions,
          relatedTo: parsedRelatedTo,
          student: studentId,
          checksum,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        };

        const document = await Document.create(documentData);

        await document.populate([
          { path: 'uploadedBy', select: 'name email' },
          { path: 'student', select: 'firstName lastName admissionNumber' }
        ]);

        uploadedDocuments.push(document);

      } catch (error) {
        // If error occurs, clean up the uploaded file
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', unlinkError);
        }
        
        return res.status(500).json({
          success: false,
          message: `Failed to process file ${file.originalname}`,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      data: uploadedDocuments,
      count: uploadedDocuments.length,
      message: `Successfully uploaded ${uploadedDocuments.length} document(s)`
    });
  })
];

// @desc    Get documents
// @route   GET /api/documents
// @access  Private (All authenticated users)
exports.getDocuments = asyncHandler(async (req, res) => {
  const {
    category,
    type,
    status,
    studentId,
    tags,
    search,
    page = 1,
    limit = 20,
    sortBy = 'uploadedAt',
    sortOrder = 'desc'
  } = req.query;

  // Build base query
  let query = { school: req.school._id };

  // Apply filters
  if (category) query.category = category;
  if (type) query.type = type;
  if (status) query.status = status;
  if (studentId) query.student = studentId;
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
    query.tags = { $in: tagArray };
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Permission-based filtering for non-admin users
  if (req.user.role !== 'admin' && req.user.role !== 'principal') {
    query.$or = [
      { uploadedBy: req.user.id }, // Own documents
      { isPublic: true }, // Public documents
      { 'accessPermissions.roles': req.user.role }, // Role-based access
      { 'accessPermissions.users': req.user.id } // User-specific access
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;

  const documents = await Document.find(query)
    .populate('uploadedBy', 'name email')
    .populate('student', 'firstName lastName admissionNumber')
    .populate('verifiedBy', 'name email')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Document.countDocuments(query);

  res.status(200).json({
    success: true,
    count: documents.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    data: documents
  });
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private (With permission check)
exports.getDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    school: req.school._id
  })
    .populate('uploadedBy', 'name email')
    .populate('student', 'firstName lastName admissionNumber')
    .populate('verifiedBy', 'name email')
    .populate('parentDocument', 'title fileName version');

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check access permissions
  if (!document.hasAccess(req.user.id, req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this document'
    });
  }

  res.status(200).json({
    success: true,
    data: document
  });
});

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private (With permission check)
exports.downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    school: req.school._id
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check access permissions
  if (!document.hasAccess(req.user.id, req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this document'
    });
  }

  const filePath = path.join(__dirname, '../uploads', document.filePath);

  try {
    // Check if file exists
    await fs.access(filePath);

    // Increment download count
    await document.incrementDownload();

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);

    // Stream the file
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'File not found on server'
    });
  }
});

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private (Owner/Admin)
exports.updateDocument = asyncHandler(async (req, res) => {
  let document = await Document.findOne({
    _id: req.params.id,
    school: req.school._id
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check if user can edit this document
  if (req.user.role !== 'admin' && 
      req.user.role !== 'principal' && 
      document.uploadedBy.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this document'
    });
  }

  // Parse tags if provided as string
  if (req.body.tags && typeof req.body.tags === 'string') {
    req.body.tags = req.body.tags.split(',').map(tag => tag.trim().toLowerCase());
  }

  // Parse accessPermissions if provided as string
  if (req.body.accessPermissions && typeof req.body.accessPermissions === 'string') {
    try {
      req.body.accessPermissions = JSON.parse(req.body.accessPermissions);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid accessPermissions format'
      });
    }
  }

  document = await Document.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('uploadedBy', 'name email')
    .populate('student', 'firstName lastName admissionNumber')
    .populate('verifiedBy', 'name email');

  res.status(200).json({
    success: true,
    data: document,
    message: 'Document updated successfully'
  });
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Owner/Admin)
exports.deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    school: req.school._id
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check if user can delete this document
  if (req.user.role !== 'admin' && 
      req.user.role !== 'principal' && 
      document.uploadedBy.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this document'
    });
  }

  // Soft delete (mark as deleted instead of actually deleting)
  document.status = 'deleted';
  await document.save();

  // Optionally delete the physical file (uncomment if needed)
  /*
  const filePath = path.join(__dirname, '../uploads', document.filePath);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete physical file:', error);
  }
  */

  res.status(200).json({
    success: true,
    message: 'Document deleted successfully'
  });
});

// @desc    Verify document
// @route   PUT /api/documents/:id/verify
// @access  Private (Admin/Principal)
exports.verifyDocument = asyncHandler(async (req, res) => {
  const { isVerified, notes } = req.body;

  const document = await Document.findOne({
    _id: req.params.id,
    school: req.school._id
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  document.isVerified = isVerified;
  document.verifiedBy = req.user.id;
  document.verificationDate = new Date();
  document.status = isVerified ? 'active' : 'pending_verification';
  
  if (notes) {
    document.notes = notes;
  }

  await document.save();

  await document.populate([
    { path: 'verifiedBy', select: 'name email' },
    { path: 'uploadedBy', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    data: document,
    message: `Document ${isVerified ? 'verified' : 'rejected'} successfully`
  });
});

// @desc    Get document statistics
// @route   GET /api/documents/stats
// @access  Private (Admin/Principal)
exports.getDocumentStats = asyncHandler(async (req, res) => {
  const { category, type, userId } = req.query;

  let filters = {};
  if (category) filters.category = category;
  if (type) filters.type = type;
  if (userId) filters.uploadedBy = userId;

  const stats = await Document.getStorageStats(req.school._id, filters.category);

  // Get document counts by category
  const categoryStats = await Document.aggregate([
    { 
      $match: { 
        school: req.school._id,
        status: 'active',
        ...filters
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get recent uploads
  const recentUploads = await Document.find({
    school: req.school._id,
    status: 'active'
  })
    .populate('uploadedBy', 'name')
    .sort({ uploadedAt: -1 })
    .limit(10)
    .select('title fileName fileSize uploadedAt uploadedBy category');

  res.status(200).json({
    success: true,
    data: {
      overview: stats,
      byCategory: categoryStats,
      recentUploads
    }
  });
});

module.exports = {
  uploadDocument: exports.uploadDocument,
  getDocuments: exports.getDocuments,
  getDocument: exports.getDocument,
  downloadDocument: exports.downloadDocument,
  updateDocument: exports.updateDocument,
  deleteDocument: exports.deleteDocument,
  verifyDocument: exports.verifyDocument,
  getDocumentStats: exports.getDocumentStats
};