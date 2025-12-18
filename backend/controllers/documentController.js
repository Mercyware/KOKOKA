const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');

// Helper to handle BigInt serialization
const serializeDocument = (doc) => {
  if (!doc) return null;
  const serialized = { ...doc };
  if (typeof doc.fileSize === 'bigint') {
    serialized.fileSize = Number(doc.fileSize); // Safe for < 9PB
  }

  // Compatibility with Mongoose frontend
  if (serialized.id) serialized._id = serialized.id;
  if (serialized.uploadedBy && serialized.uploadedBy.id) serialized.uploadedBy._id = serialized.uploadedBy.id;
  if (serialized.student && serialized.student.id) serialized.student._id = serialized.student.id;
  if (serialized.verifiedBy && serialized.verifiedBy.id) serialized.verifiedBy._id = serialized.verifiedBy.id;

  return serialized;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Ensure req.school exists (authed routes should have it via middleware)
    if (!req.school) {
      return cb(new Error('School context required for upload'));
    }
    const uploadPath = path.join(__dirname, '../uploads', req.school.id.toString());
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
      staffId,
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
            parsedPermissions = typeof accessPermissions === 'string'
              ? JSON.parse(accessPermissions)
              : accessPermissions;
          } catch (e) {
            parsedPermissions = {};
          }
        }

        // Parse related entity
        let parsedMetadata = {};
        if (relatedTo) {
          try {
            const rt = typeof relatedTo === 'string' ? JSON.parse(relatedTo) : relatedTo;
            parsedMetadata.relatedTo = rt;
          } catch (e) {
            // ignore
          }
        }

        if (staffId) {
          parsedMetadata.staffId = staffId;
        }

        // Create document record
        const documentData = {
          schoolId: req.school.id,
          title: title || path.basename(file.originalname, path.extname(file.originalname)),
          fileName: file.filename,
          originalName: file.originalname,
          filePath: path.relative(path.join(__dirname, '../uploads'), file.path),
          fileUrl: `/uploads/${req.school.id}/${file.filename}`,
          // fileType field doesn't exist in Prisma model? Schema has type (enum) and mimeType.
          // Schema also has fileExtension.
          fileExtension: path.extname(file.originalname).substring(1).toUpperCase(),
          mimeType: file.mimetype,
          fileSize: file.size, // Will be BigInt in Prisma, passing number is fine for create
          type: type || 'OTHER', // Enum default
          category: category || 'OTHER', // Enum default
          subcategory,
          description,
          tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim().toLowerCase()) : tags) : [],
          uploadedById: req.user.id,
          isPublic: isPublic === 'true' || isPublic === true,
          accessPermissions: parsedPermissions,
          metadata: parsedMetadata,
          checksum,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          status: 'ACTIVE'
        };

        if (studentId) {
          documentData.studentId = studentId;
        }

        const document = await prisma.document.create({
          data: documentData,
          include: {
            uploadedBy: {
              select: { id: true, name: true, email: true }
            },
            student: {
              select: { id: true, firstName: true, lastName: true, admissionNumber: true }
            }
          }
        });

        uploadedDocuments.push(serializeDocument(document));

      } catch (error) {
        // If error occurs, clean up the uploaded file
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Failed to clean up file:', unlinkError);
        }

        console.error("Upload error:", error);
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
    sortBy = 'createdAt', // Prisma defaults to createdAt usually, Mongoose had uploadedAt
    sortOrder = 'desc'
  } = req.query;

  // Build base query
  let where = { schoolId: req.school.id };

  // Apply filters
  if (category) where.category = category;
  if (type) where.type = type;
  if (status) where.status = status;
  if (studentId) where.studentId = studentId;
  if (req.query.uploadedBy) where.uploadedById = req.query.uploadedBy;
  if (req.query.staffId) {
    where.metadata = {
      path: ['staffId'],
      equals: req.query.staffId
    };
  }

  // Text search simulation with OR
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { originalName: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Permission-based filtering for non-admin users
  if (req.user.role !== 'admin' && req.user.role !== 'principal') {
    // This requires complex OR logic at the top level.
    // (uploadedBy == user) OR (isPublic == true) OR ...
    // Note: merging with existing 'where' (schoolId)
    // Prisma where: { AND: [ { schoolId }, { OR: [...] } ] }
    const permissionOr = [
      { uploadedById: req.user.id },
      { isPublic: true }
    ];

    where = {
      AND: [
        where,
        { OR: permissionOr }
      ]
    };
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
        verifiedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { [sortBy]: sortOrder.toLowerCase() },
      skip,
      take
    }),
    prisma.document.count({ where })
  ]);

  res.status(200).json({
    success: true,
    count: documents.length,
    total,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    data: documents.map(serializeDocument)
  });
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private (With permission check)
exports.getDocument = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
      student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
      verifiedBy: { select: { id: true, name: true, email: true } },
      parentDocument: { select: { title: true, fileName: true, version: true } }
    }
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check access permissions - simplified
  const isOwner = document.uploadedById === req.user.id;
  const isAdmin = ['admin', 'principal'].includes(req.user.role);
  const isPublic = document.isPublic;

  if (!isOwner && !isAdmin && !isPublic) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this document'
    });
  }

  res.status(200).json({
    success: true,
    data: serializeDocument(document)
  });
});

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private (With permission check)
exports.downloadDocument = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check access permissions
  const isOwner = document.uploadedById === req.user.id;
  const isAdmin = ['admin', 'principal'].includes(req.user.role);
  const isPublic = document.isPublic;

  if (!isOwner && !isAdmin && !isPublic) {
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
    await prisma.document.update({
      where: { id: document.id },
      data: { downloadCount: { increment: 1 } }
    });

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
  let document = await prisma.document.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
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
    document.uploadedById !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this document'
    });
  }

  // Prepare update data
  const updateData = { ...req.body };

  if (updateData.tags && typeof updateData.tags === 'string') {
    updateData.tags = updateData.tags.split(',').map(tag => tag.trim().toLowerCase());
  }

  if (updateData.accessPermissions && typeof updateData.accessPermissions === 'string') {
    try {
      updateData.accessPermissions = JSON.parse(updateData.accessPermissions);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid accessPermissions format'
      });
    }
  }

  document = await prisma.document.update({
    where: { id: req.params.id },
    data: updateData,
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
      student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
      verifiedBy: { select: { id: true, name: true, email: true } }
    }
  });

  res.status(200).json({
    success: true,
    data: serializeDocument(document),
    message: 'Document updated successfully'
  });
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Owner/Admin)
exports.deleteDocument = asyncHandler(async (req, res) => {
  const document = await prisma.document.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
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
    document.uploadedById !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this document'
    });
  }

  // Mark as deleted (Soft delete)
  // Assuming 'status' is a enum, does it have 'DELETED'?
  // Schema snippet showed DocumentStatus enum: ACTIVE, EXPIRED, REVOKED, PENDING_VERIFICATION, ARCHIVED, DELETED.
  await prisma.document.update({
    where: { id: req.params.id },
    data: { status: 'DELETED' }
  });

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

  const document = await prisma.document.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  const updatedDoc = await prisma.document.update({
    where: { id: req.params.id },
    data: {
      isVerified,
      verifiedById: req.user.id,
      verificationDate: new Date(),
      status: isVerified ? 'ACTIVE' : 'PENDING_VERIFICATION',
      notes: notes || document.notes
    },
    include: {
      verifiedBy: { select: { id: true, name: true, email: true } },
      uploadedBy: { select: { id: true, name: true, email: true } }
    }
  });

  res.status(200).json({
    success: true,
    data: serializeDocument(updatedDoc),
    message: `Document ${isVerified ? 'verified' : 'rejected'} successfully`
  });
});

// @desc    Get document statistics
// @route   GET /api/documents/stats
// @access  Private (Admin/Principal)
exports.getDocumentStats = asyncHandler(async (req, res) => {
  // Stats requiring aggregation. Simplified implementation.
  const { category, type, userId } = req.query;

  const where = {
    schoolId: req.school.id,
    status: 'ACTIVE'
  };

  if (category) where.category = category;
  if (type) where.type = type;
  if (userId) where.uploadedById = userId;

  // Group by category
  const categoryStatsRaw = await prisma.document.groupBy({
    by: ['category'],
    where,
    _count: { _all: true },
    _sum: { fileSize: true }
  });

  const categoryStats = categoryStatsRaw.map(stat => ({
    _id: stat.category,
    count: stat._count._all,
    totalSize: Number(stat._sum.fileSize || 0)
  }));

  // Overview
  // getStorageStats was a custom method on Mongoose model. We simulate it.
  const totalCount = categoryStats.reduce((acc, curr) => acc + curr.count, 0);
  const totalSize = categoryStats.reduce((acc, curr) => acc + curr.totalSize, 0);

  const stats = {
    count: totalCount,
    size: totalSize
  };

  // Recent uploads
  const recentUploads = await prisma.document.findMany({
    where,
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  res.status(200).json({
    success: true,
    data: {
      overview: stats,
      byCategory: categoryStats,
      recentUploads: recentUploads.map(serializeDocument)
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