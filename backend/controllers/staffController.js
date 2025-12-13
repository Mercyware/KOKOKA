const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { generateSecurePassword } = require('../utils/passwordGenerator');
const queuedEmailService = require('../services/queuedEmailService');

const prisma = new PrismaClient();

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
exports.getAllStaff = asyncHandler(async (req, res) => {
  const staff = await prisma.staff.findMany({
    where: {
      schoolId: req.school.id
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          profileImage: true
        }
      },
      department: {
        select: {
          name: true
        }
      },
      teacherSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      },
      subjectAssignments: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          class: {
            select: {
              id: true,
              name: true,
              grade: true
            }
          }
        }
      },
      classTeachers: {
        include: {
          class: {
            select: {
              id: true,
              name: true,
              grade: true
            }
          }
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    count: staff.length,
    data: staff
  });
});

// @desc    Get staff by ID
// @route   GET /api/staff/:id
// @access  Private/Admin or Self
exports.getStaffById = asyncHandler(async (req, res) => {
  const staff = await prisma.staff.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          profileImage: true
        }
      },
      department: {
        select: {
          name: true,
          description: true
        }
      },
      teacherSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      },
      subjectAssignments: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          class: {
            select: {
              id: true,
              name: true,
              grade: true
            }
          }
        }
      },
      classTeachers: {
        include: {
          class: {
            select: {
              id: true,
              name: true,
              grade: true
            }
          }
        }
      },
      qualifications: {
        orderBy: {
          yearObtained: 'desc'
        }
      }
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Create new staff
// @route   POST /api/staff
// @access  Private/Admin
exports.createStaff = asyncHandler(async (req, res) => {
  const {
    user, userId, employeeId, staffType, dateOfBirth, gender, nationalId,
    address, contactInfo, qualifications, department, position,
    schedule, experience, specializations, certifications,
    achievements, salary, bankDetails, documents, status, accessPermissions,
    firstName, lastName, middleName, phone, streetAddress, city, state, zipCode, country, photo
  } = req.body;

  let userObj;

  let generatedPassword = null;

  // If user object is provided, create a new user
  if (user && !userId) {
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    });
    if (existingUser) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    // Generate secure password for the new user
    generatedPassword = generateSecurePassword(12);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create new user
    userObj = await prisma.user.create({
      data: {
        schoolId: req.school.id,
        name: user.name,
        email: user.email,
        passwordHash: hashedPassword,
        role: user.role || 'STAFF'
      }
    });
  } else if (userId) {
    // Check if user exists
    userObj = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!userObj) {
      res.status(404);
      throw new Error('User not found');
    }
  } else {
    res.status(400);
    throw new Error('Either user details or userId must be provided');
  }

  // Check if staff with this employee ID already exists
  const staffExists = await prisma.staff.findFirst({
    where: {
      employeeId,
      schoolId: req.school.id
    }
  });
  if (staffExists) {
    res.status(400);
    throw new Error('Staff with this employee ID already exists');
  }

  // Create staff
  const staff = await prisma.staff.create({
    data: {
      schoolId: req.school.id,
      userId: userObj.id,
      employeeId,
      firstName,
      lastName,
      middleName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
      phone,
      streetAddress,
      city,
      state,
      zipCode,
      country,
      photo,
      position,
      staffType: staffType || 'GENERAL',
      joiningDate: new Date(),
      salary: salary ? parseFloat(salary) : null,
      status: status || 'ACTIVE'
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          profileImage: true
        }
      },
      department: {
        select: {
          name: true
        }
      }
    }
  });

  // Update user role based on staff type
  await prisma.user.update({
    where: { id: userObj.id },
    data: { role: 'STAFF' }
  });

  // Send welcome email with login credentials if password was generated (queued, non-blocking)
  if (generatedPassword) {
    // Queue the email asynchronously - don't wait for it to complete
    queuedEmailService.sendEmail({
      to: userObj.email,
      subject: `Welcome to ${req.school.name || 'School'} - Your Account Details`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0891B2;">Welcome to ${req.school.name || 'School'}!</h2>
          <p>Dear ${userObj.name},</p>
          <p>Your staff account has been created successfully. Below are your login credentials:</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Email:</strong> ${userObj.email}</p>
            <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${generatedPassword}</code></p>
            <p style="margin: 10px 0;"><strong>Employee ID:</strong> ${employeeId}</p>
            <p style="margin: 10px 0;"><strong>Position:</strong> ${position || 'Staff'}</p>
          </div>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Important Security Notice:</strong></p>
            <p style="margin: 10px 0 0 0; color: #856404;">Please change your password immediately after your first login for security purposes.</p>
          </div>

          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}" style="display: inline-block; padding: 12px 24px; background-color: #0891B2; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Your Account</a>
          </p>

          <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            If you have any questions or need assistance, please contact the school administration.
          </p>

          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          <p style="color: #6c757d; font-size: 12px; text-align: center;">
            This is an automated message from ${req.school.name || 'School'}. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `Welcome to ${req.school.name || 'School'}!\n\nDear ${userObj.name},\n\nYour staff account has been created successfully.\n\nLogin Credentials:\nEmail: ${userObj.email}\nTemporary Password: ${generatedPassword}\nEmployee ID: ${employeeId}\nPosition: ${position || 'Staff'}\n\nIMPORTANT: Please change your password immediately after your first login.\n\nLogin URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}\n\nIf you have any questions, please contact the school administration.`,
      priority: 3 // Higher priority for welcome emails
    }).catch(err => {
      // Log error but don't fail the request
      console.error('Failed to queue welcome email:', err);
    });
  }

  res.status(201).json({
    success: true,
    data: staff,
    message: generatedPassword ? 'Staff created successfully. Login credentials have been sent to their email.' : 'Staff created successfully.'
  });
});

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private/Admin
exports.updateStaff = asyncHandler(async (req, res) => {
  const staff = await prisma.staff.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  // If employee ID is being updated, check if it already exists
  if (req.body.employeeId && req.body.employeeId !== staff.employeeId) {
    const staffWithEmployeeId = await prisma.staff.findFirst({
      where: {
        employeeId: req.body.employeeId,
        schoolId: req.school.id
      }
    });
    if (staffWithEmployeeId) {
      res.status(400);
      throw new Error('Staff with this employee ID already exists');
    }
  }

  const updatedStaff = await prisma.staff.update({
    where: { id: req.params.id },
    data: {
      employeeId: req.body.employeeId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      middleName: req.body.middleName,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
      gender: req.body.gender,
      phone: req.body.phone,
      streetAddress: req.body.streetAddress,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country,
      photo: req.body.photo,
      position: req.body.position,
      staffType: req.body.staffType,
      salary: req.body.salary ? parseFloat(req.body.salary) : undefined,
      status: req.body.status
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          profileImage: true
        }
      },
      department: {
        select: {
          name: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    data: updatedStaff
  });
});

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private/Admin
exports.deleteStaff = asyncHandler(async (req, res) => {
  const staff = await prisma.staff.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  // Delete staff (this will cascade delete due to Prisma schema)
  await prisma.staff.delete({
    where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get staff by user ID
// @route   GET /api/staff/user/:userId
// @access  Private/Admin or Self
exports.getStaffByUserId = asyncHandler(async (req, res) => {
  const staff = await prisma.staff.findFirst({
    where: {
      userId: req.params.userId,
      schoolId: req.school.id
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          profileImage: true
        }
      },
      department: {
        select: {
          name: true
        }
      }
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  res.status(200).json({
    success: true,
    data: staff
  });
});

// @desc    Get staff by department
// @route   GET /api/staff/department/:departmentId
// @access  Private/Admin
exports.getStaffByDepartment = asyncHandler(async (req, res) => {
  const staff = await prisma.staff.findMany({
    where: {
      departmentId: req.params.departmentId,
      schoolId: req.school.id
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          profileImage: true
        }
      },
      department: {
        select: {
          name: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    count: staff.length,
    data: staff
  });
});

// @desc    Get staff by type
// @route   GET /api/staff/type/:staffType
// @access  Private/Staff
exports.getStaffByType = asyncHandler(async (req, res) => {
  const staff = await prisma.staff.findMany({
    where: {
      staffType: req.params.staffType,
      schoolId: req.school.id
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          profileImage: true
        }
      },
      department: {
        select: {
          name: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    count: staff.length,
    data: staff
  });
});

// @desc    Add staff attendance
// @route   POST /api/staff/:id/attendance
// @access  Private/Admin
exports.addStaffAttendance = asyncHandler(async (req, res) => {
  const { date, status, remark } = req.body;

  const staff = await prisma.staff.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  // Note: This would require a StaffAttendance model in the schema
  // For now, returning a placeholder response
  res.status(200).json({
    success: true,
    message: 'Attendance functionality not yet implemented - requires StaffAttendance model',
    data: {
      staffId: req.params.id,
      date,
      status,
      remark
    }
  });
});

// @desc    Add staff leave
// @route   POST /api/staff/:id/leave
// @access  Private/Admin or Self
exports.addStaffLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason, documents } = req.body;

  const staff = await prisma.staff.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  // Note: This would require a StaffLeave model in the schema
  // For now, returning a placeholder response
  res.status(200).json({
    success: true,
    message: 'Leave functionality not yet implemented - requires StaffLeave model',
    data: {
      staffId: req.params.id,
      leaveType,
      startDate,
      endDate,
      reason,
      documents
    }
  });
});

// @desc    Update leave status
// @route   PUT /api/staff/:id/leave/:leaveId
// @access  Private/Admin
exports.updateLeaveStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const staff = await prisma.staff.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  // Note: This would require a StaffLeave model in the schema
  // For now, returning a placeholder response
  res.status(200).json({
    success: true,
    message: 'Leave status update not yet implemented - requires StaffLeave model',
    data: {
      staffId: req.params.id,
      leaveId: req.params.leaveId,
      status
    }
  });
});

// @desc    Add performance review
// @route   POST /api/staff/:id/review
// @access  Private/Admin
exports.addPerformanceReview = asyncHandler(async (req, res) => {
  const { reviewDate, ratings, overallRating, comments, goals } = req.body;

  const staff = await prisma.staff.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  // Note: This would require a StaffReview model in the schema
  // For now, returning a placeholder response
  res.status(200).json({
    success: true,
    message: 'Performance review functionality not yet implemented - requires StaffReview model',
    data: {
      staffId: req.params.id,
      reviewDate,
      ratings,
      overallRating,
      comments,
      goals
    }
  });
});

// @desc    Update access permissions
// @route   PUT /api/staff/:id/permissions
// @access  Private/Admin
exports.updateAccessPermissions = asyncHandler(async (req, res) => {
  const {
    canViewStudentRecords,
    canEditStudentRecords,
    canViewFinancialRecords,
    canEditFinancialRecords,
    canViewStaffRecords,
    canEditStaffRecords,
    canManageUsers,
    canManageSystem
  } = req.body;

  const staff = await prisma.staff.findFirst({
    where: {
      id: req.params.id,
      schoolId: req.school.id
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  // Note: This would require updating the Staff model to include permissions fields
  // For now, returning a placeholder response
  res.status(200).json({
    success: true,
    message: 'Access permissions update not yet implemented - requires permissions fields in Staff model',
    data: {
      staffId: req.params.id,
      permissions: {
        canViewStudentRecords,
        canEditStudentRecords,
        canViewFinancialRecords,
        canEditFinancialRecords,
        canViewStaffRecords,
        canEditStaffRecords,
        canManageUsers,
        canManageSystem
      }
    }
  });
});

// @desc    Upload staff profile picture
// @route   POST /api/staff/:id/profile-picture
// @access  Private/Admin or Self
exports.uploadProfilePicture = async (req, res) => {
  const fileUploadService = require('../utils/fileUploadService');
  
  try {
    const staffId = req.params.id;
    
    // Check if staff exists
    const staff = await prisma.staff.findFirst({
      where: { 
        id: staffId,
        schoolId: req.school.id 
      }
      // Note: profilePicture relation removed for database compatibility
    });
    
    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found' 
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    // Validate image
    const validation = await fileUploadService.validateImage(req.file.buffer, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      minWidth: 100,
      minHeight: 100,
      maxWidth: 2000,
      maxHeight: 2000
    });

    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: validation.error 
      });
    }

    // Delete old profile picture if exists
    // Note: For database compatibility, we'll handle file cleanup separately
    // if (staff.profilePicture) {
    //   try {
    //     await fileUploadService.deleteFile(staff.profilePicture.id);
    //   } catch (error) {
    //     console.warn('Warning: Failed to delete old profile picture:', error.message);
    //     // Continue with upload even if old image deletion fails
    //   }
    // }

    // Upload new profile picture
    const uploadResult = await fileUploadService.uploadProfilePicture(
      req.file.buffer,
      {
        entityId: staffId,
        entityType: 'Staff',
        schoolId: staff.schoolId,
        uploadedById: req.user?.id,
        fileName: `${staff.firstName}_${staff.lastName}_profile.jpg`
      }
    );

    // Update staff record with new profile picture reference
    // Handle both with and without profilePictureId field for database compatibility
    const updateData = {
      // Always update the legacy photo field for backward compatibility
      photo: uploadResult.file.fileUrl
    };

    // Only add profilePictureId if the field exists in the database
    try {
      updateData.profilePictureId = uploadResult.file.id;
    } catch (error) {
      console.warn('profilePictureId field may not exist in database, using photo field only');
    }

    const updatedStaff = await prisma.staff.update({
      where: { id: staffId },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
            profileImage: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        data: {
          id: updatedStaff.id,
          firstName: updatedStaff.firstName,
          lastName: updatedStaff.lastName,
          profilePictureUrl: updatedStaff.profilePicture?.fileUrl || updatedStaff.photo,
          photo: updatedStaff.photo,
          updatedAt: updatedStaff.updatedAt
        },
        file: {
          id: uploadResult.file.id,
          url: uploadResult.file.fileUrl,
          fileName: uploadResult.file.fileName,
          fileSize: uploadResult.file.fileSize
        }
      }
    });

  } catch (error) {
    console.error('Error uploading staff profile picture:', error);
    
    // Provide specific error messages for common issues
    if (error.message.includes('AWS') || error.message.includes('S3')) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to upload image to storage service',
        error: 'STORAGE_ERROR'
      });
    }
    
    if (error.message.includes('Invalid image')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid image file provided',
        error: 'INVALID_IMAGE'
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred while uploading profile picture',
      error: error.message 
    });
  }
};

// @desc    Delete staff profile picture
// @route   DELETE /api/staff/:id/profile-picture
// @access  Private/Admin or Self
exports.deleteProfilePicture = async (req, res) => {
  const fileUploadService = require('../utils/fileUploadService');
  
  try {
    const staffId = req.params.id;
    
    // Check if staff exists
    const staff = await prisma.staff.findFirst({
      where: { 
        id: staffId,
        schoolId: req.school.id 
      }
      // Note: profilePicture relation removed for database compatibility
    });
    
    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found' 
      });
    }

    // Delete profile picture file if exists
    // Note: For database compatibility, we'll handle file cleanup separately
    // if (staff.profilePicture) {
    //   try {
    //     await fileUploadService.deleteFile(staff.profilePicture.id);
    //   } catch (error) {
    //     console.warn('Warning: Failed to delete profile picture file:', error.message);
    //     // Continue with database update even if file deletion fails
    //   }
    // }

    // Update staff record to remove profile picture reference
    // Handle both with and without profilePictureId field for database compatibility
    const updateData = {
      photo: null // Always clear legacy field
    };

    // Only add profilePictureId if the field exists in the database
    try {
      updateData.profilePictureId = null;
    } catch (error) {
      console.warn('profilePictureId field may not exist in database, using photo field only');
    }

    const updatedStaff = await prisma.staff.update({
      where: { id: staffId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        photo: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: {
        staff: updatedStaff
      }
    });

  } catch (error) {
    console.error('Error deleting staff profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while deleting profile picture',
      error: error.message
    });
  }
};

// @desc    Add qualification to staff
// @route   POST /api/staff/:id/qualifications
// @access  Private/Admin
exports.addQualification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { degree, institution, fieldOfStudy, yearObtained, grade, description } = req.body;

  // Verify staff exists and belongs to the school
  const staff = await prisma.staff.findFirst({
    where: {
      id,
      schoolId: req.school.id
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  // Create qualification
  const qualification = await prisma.qualification.create({
    data: {
      staffId: id,
      degree,
      institution,
      fieldOfStudy,
      yearObtained: yearObtained ? parseInt(yearObtained) : null,
      grade,
      description
    }
  });

  res.status(201).json({
    success: true,
    message: 'Qualification added successfully',
    data: qualification
  });
});

// @desc    Update qualification
// @route   PUT /api/staff/:staffId/qualifications/:qualificationId
// @access  Private/Admin
exports.updateQualification = asyncHandler(async (req, res) => {
  const { staffId, qualificationId } = req.params;
  const { degree, institution, fieldOfStudy, yearObtained, grade, description } = req.body;

  // Verify staff exists and belongs to the school
  const staff = await prisma.staff.findFirst({
    where: {
      id: staffId,
      schoolId: req.school.id
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  // Verify qualification exists and belongs to this staff
  const existingQualification = await prisma.qualification.findFirst({
    where: {
      id: qualificationId,
      staffId
    }
  });

  if (!existingQualification) {
    res.status(404);
    throw new Error('Qualification not found');
  }

  // Update qualification
  const qualification = await prisma.qualification.update({
    where: { id: qualificationId },
    data: {
      degree,
      institution,
      fieldOfStudy,
      yearObtained: yearObtained ? parseInt(yearObtained) : null,
      grade,
      description
    }
  });

  res.status(200).json({
    success: true,
    message: 'Qualification updated successfully',
    data: qualification
  });
});

// @desc    Delete qualification
// @route   DELETE /api/staff/:staffId/qualifications/:qualificationId
// @access  Private/Admin
exports.deleteQualification = asyncHandler(async (req, res) => {
  const { staffId, qualificationId } = req.params;

  // Verify staff exists and belongs to the school
  const staff = await prisma.staff.findFirst({
    where: {
      id: staffId,
      schoolId: req.school.id
    }
  });

  if (!staff) {
    res.status(404);
    throw new Error('Staff not found');
  }

  // Verify qualification exists and belongs to this staff
  const qualification = await prisma.qualification.findFirst({
    where: {
      id: qualificationId,
      staffId
    }
  });

  if (!qualification) {
    res.status(404);
    throw new Error('Qualification not found');
  }

  // Delete qualification
  await prisma.qualification.delete({
    where: { id: qualificationId }
  });

  res.status(200).json({
    success: true,
    message: 'Qualification deleted successfully'
  });
});
