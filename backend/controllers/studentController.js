const { 
  studentHelpers, 
  guardianHelpers, 
  documentHelpers, 
  academicYearHelpers,
  prisma
} = require('../utils/prismaHelpers');

// Get all students with pagination, filtering, and sorting via class history and academic year
exports.getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'firstName',
      order = 'asc',
      status,
      class: classId,
      section,
      search,
      admissionDateFrom,
      admissionDateTo,
      gender,
      academicYear
    } = req.query;

    // Determine academic year to use
    let academicYearId = academicYear;
    if (!academicYearId) {
      // Get current academic year for the school
      const activeYear = await prisma.academicYear.findFirst({
        where: {
          schoolId: req.school.id,
          isCurrent: true
        }
      });
      if (!activeYear) {
        return res.status(400).json({ message: 'No active academic year found for this school.' });
      }
      academicYearId = activeYear.id;
    }

    // Build where clause for student class history
    const historyWhere = {
      schoolId: req.school.id,
      academicYearId: academicYearId,
      status: 'ACTIVE' // Only get active class assignments
    };

    // Filter by class if provided
    if (classId) {
      historyWhere.classId = classId;
    }

    // Filter by section if provided
    if (section) {
      historyWhere.sectionId = section;
    }

    // Build where clause for student filtering
    const studentWhere = {};

    // Filter by status if provided
    if (status) {
      studentWhere.status = status;
    }

    // Filter by gender if provided
    if (gender) {
      studentWhere.gender = gender;
    }

    // Filter by admission date range if provided
    if (admissionDateFrom || admissionDateTo) {
      studentWhere.admissionDate = {};
      if (admissionDateFrom) {
        studentWhere.admissionDate.gte = new Date(admissionDateFrom);
      }
      if (admissionDateTo) {
        studentWhere.admissionDate.lte = new Date(admissionDateTo);
      }
    }

    // Search by name or admission number
    if (search) {
      studentWhere.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { admissionNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Add student where conditions to history where
    if (Object.keys(studentWhere).length > 0) {
      historyWhere.student = studentWhere;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build order by clause - need to handle student fields
    const orderBy = {};
    if (sort === 'firstName' || sort === 'lastName' || sort === 'admissionNumber' || sort === 'admissionDate') {
      orderBy.student = { [sort]: order === 'desc' ? 'desc' : 'asc' };
    } else {
      orderBy[sort] = order === 'desc' ? 'desc' : 'asc';
    }

    // Execute query with pagination and sorting - Query from StudentClassHistory
    const [classHistoryRecords, total] = await Promise.all([
      prisma.studentClassHistory.findMany({
        where: historyWhere,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          student: {
            include: {
              school: { select: { name: true } },
              academicYear: { select: { name: true } },
              house: { select: { name: true } },
              user: { select: { name: true, email: true } },
              guardianStudents: {
                where: { isPrimary: true },
                include: {
                  guardian: {
                    select: {
                      firstName: true,
                      lastName: true,
                      phone: true,
                      email: true
                    }
                  }
                }
              }
            }
          },
          class: { select: { name: true, grade: true } },
          section: { select: { name: true } },
          academicYear: { select: { name: true, startDate: true, endDate: true } }
        }
      }),
      prisma.studentClassHistory.count({ where: historyWhere })
    ]);

    // Transform the data to match the expected format
    const students = classHistoryRecords.map(record => ({
      ...record.student,
      currentClass: record.class,
      currentSection: record.section,
      classHistoryId: record.id,
      classStartDate: record.startDate,
      classEndDate: record.endDate,
      // Override academicYear with the one from class history
      academicYear: record.academicYear
    }));

    res.json({
      success: true,
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching students from class history:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get student by ID with detailed information
exports.getStudentById = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        school: { select: { name: true } },
        currentClass: { select: { name: true, grade: true } },
        currentSection: { select: { name: true } },
        academicYear: { select: { name: true, startDate: true, endDate: true } },
        house: { select: { name: true, color: true } },
        user: { select: { name: true, email: true } },
        guardianStudents: {
          include: {
            guardian: { 
              select: { 
                id: true,
                firstName: true, 
                lastName: true, 
                phone: true, 
                email: true,
                occupation: true
              } 
            }
          }
        },
        documents: { 
          select: { 
            id: true,
            title: true, 
            category: true,
            type: true, 
            fileUrl: true, 
            createdAt: true, 
            status: true 
          } 
        },
        grades: {
          include: {
            assessment: {
              select: {
                id: true,
                title: true,
                type: true,
                totalMarks: true,
                scheduledDate: true,
                subject: { select: { name: true } }
              }
            }
          }
        },
        attendance: {
          take: 10,
          orderBy: { date: 'desc' },
          select: {
            id: true,
            date: true,
            status: true,
            period: true,
            checkInTime: true,
            checkOutTime: true
          }
        }
      }
    });
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create new student with optional guardian information
exports.createStudent = async (req, res) => {
  try {
    const { 
      // Basic Information
      firstName, 
      lastName, 
      middleName,
      email,
      admissionNumber,
      admissionDate,
      academicYear: academicYearId,
      class: classId,
      section: sectionId,
      house: houseId,
      dateOfBirth,
      gender,
      phone,
      
      // Address Information
      streetAddress,
      city,
      state,
      zipCode,
      country,
      
      // Permanent Address
      permanentStreetAddress,
      permanentCity,
      permanentState,
      permanentZipCode,
      permanentCountry,
      
      // Additional Personal Information
      placeOfBirth,
      nationality,
      religion,
      bloodGroup,
      motherTongue,
      previousSchool,
      previousClass,
      tcNumber,
      tcDate,
      
      // Medical Information
      medicalInfo,
      allergies,
      medications,
      medicalConditions,
      immunizations,
      emergencyMedicalInfo,
      doctorName,
      doctorPhone,
      hospitalPreference,
      emergencyContacts,
      
      // Academic Background
      previousAcademicRecord,
      specialNeeds,
      talents,
      extracurriculars,
      
      // Administrative Information
      applicationDate,
      interviewDate,
      admissionTestScore,
      feesPaid,
      scholarshipInfo,
      transportInfo,
      
      // Behavioral and Social Information
      behavioralNotes,
      socialBackground,
      languagesSpoken,
      
      // Documents and Identification
      identificationDocs,
      photographs,
      documentsSubmitted,
      
      // Other
      guardians: guardiansData,
      status,
      photo
    } = req.body;

    // Convert gender to uppercase if provided
    const normalizedGender = gender ? gender.toUpperCase() : null;
    
    // Convert status to uppercase if provided
    const normalizedStatus = status ? status.toUpperCase() : 'ACTIVE';
    
    // Process photo if provided as base64
    let photoUrl = photo;
    if (photo && photo.startsWith('data:image')) {
      photoUrl = photo; // For now, store base64 directly
    }
    
    // Create student data object
    const studentData = {
      // Basic Information
      admissionNumber,
      firstName,
      lastName,
      middleName: middleName || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: normalizedGender,
      photo: photoUrl,
      email: email || undefined,
      phone: phone || undefined,
      
      // Address Information
      streetAddress: streetAddress || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined,
      country: country || undefined,
      
      // Permanent Address
      permanentStreetAddress: permanentStreetAddress || undefined,
      permanentCity: permanentCity || undefined,
      permanentState: permanentState || undefined,
      permanentZipCode: permanentZipCode || undefined,
      permanentCountry: permanentCountry || undefined,
      
      // Additional Personal Information
      placeOfBirth: placeOfBirth || undefined,
      nationality: nationality || undefined,
      religion: religion || undefined,
      bloodGroup: bloodGroup || undefined,
      motherTongue: motherTongue || undefined,
      previousSchool: previousSchool || undefined,
      previousClass: previousClass || undefined,
      tcNumber: tcNumber || undefined,
      tcDate: tcDate ? new Date(tcDate) : undefined,
      
      // Medical Information
      medicalInfo: medicalInfo || undefined,
      allergies: allergies && Array.isArray(allergies) ? allergies : [],
      medications: medications || undefined,
      medicalConditions: medicalConditions && Array.isArray(medicalConditions) ? medicalConditions : [],
      immunizations: immunizations || undefined,
      emergencyMedicalInfo: emergencyMedicalInfo || undefined,
      doctorName: doctorName || undefined,
      doctorPhone: doctorPhone || undefined,
      hospitalPreference: hospitalPreference || undefined,
      emergencyContacts: emergencyContacts || undefined,
      
      // Academic Background
      previousAcademicRecord: previousAcademicRecord || undefined,
      specialNeeds: specialNeeds || undefined,
      talents: talents && Array.isArray(talents) ? talents : [],
      extracurriculars: extracurriculars && Array.isArray(extracurriculars) ? extracurriculars : [],
      
      // Administrative Information
      applicationDate: applicationDate ? new Date(applicationDate) : undefined,
      interviewDate: interviewDate ? new Date(interviewDate) : undefined,
      admissionTestScore: admissionTestScore ? parseFloat(admissionTestScore) : undefined,
      feesPaid: feesPaid ? parseFloat(feesPaid) : undefined,
      scholarshipInfo: scholarshipInfo || undefined,
      transportInfo: transportInfo || undefined,
      
      // Behavioral and Social Information
      behavioralNotes: behavioralNotes || undefined,
      socialBackground: socialBackground || undefined,
      languagesSpoken: languagesSpoken && Array.isArray(languagesSpoken) ? languagesSpoken : [],
      
      // Documents and Identification
      identificationDocs: identificationDocs || undefined,
      photographs: photographs || undefined,
      documentsSubmitted: documentsSubmitted && Array.isArray(documentsSubmitted) ? documentsSubmitted : [],
      
      // Core fields
      admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
      status: normalizedStatus,
      schoolId: req.school.id,
      currentClassId: classId || undefined,
      currentSectionId: sectionId || undefined,
      academicYearId: academicYearId || undefined,
      houseId: houseId || undefined
    };
    
    // Create student using Prisma
    const student = await prisma.student.create({
      data: studentData,
      include: {
        school: { select: { name: true } },
        currentClass: { select: { name: true, grade: true } },
        currentSection: { select: { name: true } },
        academicYear: { select: { name: true } },
        house: { select: { name: true } }
      }
    });
    
    // Process guardians if provided
    if (guardiansData && guardiansData.length > 0) {
      for (const guardianData of guardiansData) {
        if (guardianData.firstName && guardianData.lastName && guardianData.phone) {
          // Check if guardian already exists by phone
          let guardian = await prisma.guardian.findFirst({
            where: {
              schoolId: req.school.id,
              phone: guardianData.phone
            }
          });
          
          // If guardian doesn't exist, create new one
          if (!guardian) {
            guardian = await prisma.guardian.create({
              data: {
                firstName: guardianData.firstName,
                lastName: guardianData.lastName,
                middleName: guardianData.middleName || undefined,
                phone: guardianData.phone,
                email: guardianData.email || undefined,
                occupation: guardianData.occupation || undefined,
                schoolId: req.school.id,
                status: 'ACTIVE'
              }
            });
          }
          
          // Create guardian-student relationship
          await prisma.guardianStudent.create({
            data: {
              guardianId: guardian.id,
              studentId: student.id,
              relationship: guardianData.relationship.toUpperCase(),
              isPrimary: guardianData.isPrimary || false,
              emergencyContact: guardianData.emergencyContact || false,
              authorizedPickup: guardianData.authorizedPickup || false,
              financialResponsibility: guardianData.financialResponsibility || false
            }
          });
        }
      }
    }
    
    // Create initial class history entry if class is provided
    if (classId) {
      // If no academic year is provided, try to get the current active academic year
      let historyAcademicYearId = academicYearId;
      if (!historyAcademicYearId) {
        const currentAcademicYear = await prisma.academicYear.findFirst({
          where: {
            schoolId: req.school.id,
            isCurrent: true
          }
        });
        if (currentAcademicYear) {
          historyAcademicYearId = currentAcademicYear.id;
        }
      }
      
      // Only create class history if we have an academic year (either provided or current)
      if (historyAcademicYearId) {
        await prisma.studentClassHistory.create({
          data: {
            studentId: student.id,
            classId: classId,
            sectionId: sectionId || null,
            schoolId: req.school.id,
            academicYearId: historyAcademicYearId,
            startDate: new Date(),
            status: 'ACTIVE'
          }
        });
      }
    }
    
    // Return student with populated references
    const result = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        school: { select: { name: true } },
        currentClass: { select: { name: true, grade: true } },
        currentSection: { select: { name: true } },
        academicYear: { select: { name: true } },
        house: { select: { name: true } },
        guardianStudents: {
          include: {
            guardian: { 
              select: { 
                firstName: true, 
                lastName: true, 
                phone: true, 
                email: true 
              } 
            }
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating student:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false,
        message: 'A student with this admission number already exists',
        error: 'Duplicate admission number' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        guardianStudents: {
          include: {
            guardian: true
          }
        }
      }
    });

    if (!existingStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Extract guardian data if provided
    const { guardians: guardiansData, ...requestData } = req.body;

    // Prepare student data with proper field mapping
    const studentData = {};

    // Map form fields to database fields
    if (requestData.firstName !== undefined) studentData.firstName = requestData.firstName;
    if (requestData.middleName !== undefined) studentData.middleName = requestData.middleName;
    if (requestData.lastName !== undefined) studentData.lastName = requestData.lastName;
    if (requestData.email !== undefined) studentData.email = requestData.email;
    if (requestData.phone !== undefined) studentData.phone = requestData.phone;
    if (requestData.admissionNumber !== undefined) studentData.admissionNumber = requestData.admissionNumber;
    
    // Address fields
    if (requestData.streetAddress !== undefined) studentData.streetAddress = requestData.streetAddress;
    if (requestData.city !== undefined) studentData.city = requestData.city;
    if (requestData.state !== undefined) studentData.state = requestData.state;
    if (requestData.zipCode !== undefined) studentData.zipCode = requestData.zipCode;
    if (requestData.country !== undefined) studentData.country = requestData.country;
    
    // Permanent address fields
    if (requestData.permanentStreetAddress !== undefined) studentData.permanentStreetAddress = requestData.permanentStreetAddress;
    if (requestData.permanentCity !== undefined) studentData.permanentCity = requestData.permanentCity;
    if (requestData.permanentState !== undefined) studentData.permanentState = requestData.permanentState;
    if (requestData.permanentZipCode !== undefined) studentData.permanentZipCode = requestData.permanentZipCode;
    if (requestData.permanentCountry !== undefined) studentData.permanentCountry = requestData.permanentCountry;
    
    // Additional personal information
    if (requestData.placeOfBirth !== undefined) studentData.placeOfBirth = requestData.placeOfBirth;
    if (requestData.nationality !== undefined) studentData.nationality = requestData.nationality;
    if (requestData.religion !== undefined) studentData.religion = requestData.religion;
    if (requestData.bloodGroup !== undefined) studentData.bloodGroup = requestData.bloodGroup;
    if (requestData.motherTongue !== undefined) studentData.motherTongue = requestData.motherTongue;
    if (requestData.previousSchool !== undefined) studentData.previousSchool = requestData.previousSchool;
    if (requestData.previousClass !== undefined) studentData.previousClass = requestData.previousClass;
    if (requestData.tcNumber !== undefined) studentData.tcNumber = requestData.tcNumber;
    
    // Medical information
    if (requestData.medicalInfo !== undefined) studentData.medicalInfo = requestData.medicalInfo;
    if (requestData.allergies !== undefined) studentData.allergies = Array.isArray(requestData.allergies) ? requestData.allergies : [];
    if (requestData.medications !== undefined) studentData.medications = requestData.medications;
    if (requestData.medicalConditions !== undefined) studentData.medicalConditions = Array.isArray(requestData.medicalConditions) ? requestData.medicalConditions : [];
    if (requestData.immunizations !== undefined) studentData.immunizations = requestData.immunizations;
    if (requestData.emergencyMedicalInfo !== undefined) studentData.emergencyMedicalInfo = requestData.emergencyMedicalInfo;
    if (requestData.doctorName !== undefined) studentData.doctorName = requestData.doctorName;
    if (requestData.doctorPhone !== undefined) studentData.doctorPhone = requestData.doctorPhone;
    if (requestData.hospitalPreference !== undefined) studentData.hospitalPreference = requestData.hospitalPreference;
    if (requestData.emergencyContacts !== undefined) studentData.emergencyContacts = requestData.emergencyContacts;
    
    // Academic background
    if (requestData.previousAcademicRecord !== undefined) studentData.previousAcademicRecord = requestData.previousAcademicRecord;
    if (requestData.specialNeeds !== undefined) studentData.specialNeeds = requestData.specialNeeds;
    if (requestData.talents !== undefined) studentData.talents = Array.isArray(requestData.talents) ? requestData.talents : [];
    if (requestData.extracurriculars !== undefined) studentData.extracurriculars = Array.isArray(requestData.extracurriculars) ? requestData.extracurriculars : [];
    
    // Administrative information
    if (requestData.admissionTestScore !== undefined) studentData.admissionTestScore = requestData.admissionTestScore ? parseFloat(requestData.admissionTestScore) : null;
    if (requestData.feesPaid !== undefined) studentData.feesPaid = requestData.feesPaid ? parseFloat(requestData.feesPaid) : null;
    if (requestData.scholarshipInfo !== undefined) studentData.scholarshipInfo = requestData.scholarshipInfo;
    if (requestData.transportInfo !== undefined) studentData.transportInfo = requestData.transportInfo;
    
    // Behavioral and social information
    if (requestData.behavioralNotes !== undefined) studentData.behavioralNotes = requestData.behavioralNotes;
    if (requestData.socialBackground !== undefined) studentData.socialBackground = requestData.socialBackground;
    if (requestData.languagesSpoken !== undefined) studentData.languagesSpoken = Array.isArray(requestData.languagesSpoken) ? requestData.languagesSpoken : [];
    
    // Documents and identification
    if (requestData.identificationDocs !== undefined) studentData.identificationDocs = requestData.identificationDocs;
    if (requestData.photographs !== undefined) studentData.photographs = requestData.photographs;
    if (requestData.documentsSubmitted !== undefined) studentData.documentsSubmitted = Array.isArray(requestData.documentsSubmitted) ? requestData.documentsSubmitted : [];

    // Map relationship fields with proper names
    if (requestData.academicYearId !== undefined) studentData.academicYearId = requestData.academicYearId;
    if (requestData.currentClassId !== undefined) studentData.currentClassId = requestData.currentClassId;
    if (requestData.currentSectionId !== undefined) studentData.currentSectionId = requestData.currentSectionId;
    if (requestData.houseId !== undefined) studentData.houseId = requestData.houseId;

    // Convert gender to uppercase if provided
    if (requestData.gender) {
      studentData.gender = requestData.gender.toUpperCase();
    }

    // Convert status to uppercase if provided
    if (requestData.status) {
      studentData.status = requestData.status.toUpperCase();
    }

    // Convert dates if provided
    if (requestData.dateOfBirth) {
      studentData.dateOfBirth = new Date(requestData.dateOfBirth);
    }

    if (requestData.admissionDate) {
      studentData.admissionDate = new Date(requestData.admissionDate);
    }
    
    if (requestData.tcDate) {
      studentData.tcDate = new Date(requestData.tcDate);
    }
    
    if (requestData.applicationDate) {
      studentData.applicationDate = new Date(requestData.applicationDate);
    }
    
    if (requestData.interviewDate) {
      studentData.interviewDate = new Date(requestData.interviewDate);
    }

    // Remove empty string and null values, but keep false values
    Object.keys(studentData).forEach(key => {
      if (studentData[key] === undefined || studentData[key] === '' || studentData[key] === null) {
        delete studentData[key];
      }
    });

    // Update student data using Prisma
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: studentData,
      include: {
        school: { select: { name: true } },
        currentClass: { select: { name: true, grade: true } },
        currentSection: { select: { name: true } },
        academicYear: { select: { name: true, startDate: true, endDate: true } },
        house: { select: { name: true, color: true } },
        user: { select: { name: true, email: true } },
        guardianStudents: {
          include: {
            guardian: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                occupation: true
              }
            }
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            category: true,
            type: true,
            fileUrl: true,
            createdAt: true,
            status: true
          }
        },
        grades: {
          include: {
            assessment: {
              select: {
                id: true,
                title: true,
                type: true,
                totalMarks: true,
                scheduledDate: true,
                subject: { select: { name: true } }
              }
            }
          }
        },
        attendance: {
          take: 10,
          orderBy: { date: 'desc' },
          select: {
            id: true,
            date: true,
            status: true,
            period: true,
            checkInTime: true,
            checkOutTime: true
          }
        }
      }
    });

    // Process guardians if provided
    if (guardiansData && guardiansData.length > 0) {
      // First, remove existing guardian relationships
      await prisma.guardianStudent.deleteMany({
        where: { studentId: studentId }
      });

      // Process each guardian
      for (const guardianData of guardiansData) {
        if (guardianData.firstName && guardianData.lastName && guardianData.phone) {
          let guardian;

          // Check if guardian already exists by phone
          guardian = await prisma.guardian.findFirst({
            where: {
              schoolId: req.school.id,
              phone: guardianData.phone
            }
          });

          // If guardian doesn't exist, create new one
          if (!guardian) {
            guardian = await prisma.guardian.create({
              data: {
                firstName: guardianData.firstName,
                lastName: guardianData.lastName,
                middleName: guardianData.middleName || undefined,
                phone: guardianData.phone,
                email: guardianData.email || undefined,
                occupation: guardianData.occupation || undefined,
                schoolId: req.school.id,
                status: 'ACTIVE'
              }
            });
          } else {
            // Update existing guardian
            guardian = await prisma.guardian.update({
              where: { id: guardian.id },
              data: {
                firstName: guardianData.firstName,
                lastName: guardianData.lastName,
                middleName: guardianData.middleName || undefined,
                email: guardianData.email || undefined,
                occupation: guardianData.occupation || undefined
              }
            });
          }

          // Create guardian-student relationship
          await prisma.guardianStudent.create({
            data: {
              guardianId: guardian.id,
              studentId: studentId,
              relationship: guardianData.relationship ? guardianData.relationship.toUpperCase() : 'OTHER',
              isPrimary: guardianData.isPrimary || false,
              emergencyContact: guardianData.emergencyContact || false,
              authorizedPickup: guardianData.authorizedPickup || false,
              financialResponsibility: guardianData.financialResponsibility || false
            }
          });
        }
      }
    }

    // Update class history if class, section, or academic year changed
    const classChanged = studentData.currentClassId &&
      studentData.currentClassId !== existingStudent.currentClassId;

    const sectionChanged = studentData.currentSectionId !== undefined &&
      studentData.currentSectionId !== existingStudent.currentSectionId;

    const academicYearChanged = studentData.academicYearId &&
      studentData.academicYearId !== existingStudent.academicYearId;

    if (classChanged || sectionChanged || academicYearChanged) {
      // Mark current active class history as completed
      await prisma.studentClassHistory.updateMany({
        where: {
          studentId: studentId,
          status: 'ACTIVE'
        },
        data: {
          status: 'COMPLETED',
          endDate: new Date()
        }
      });

      // Create new class history entry if class is provided
      if (updatedStudent.currentClassId) {
        // If no academic year is provided, try to get the current active academic year
        let historyAcademicYearId = updatedStudent.academicYearId;
        if (!historyAcademicYearId) {
          const currentAcademicYear = await prisma.academicYear.findFirst({
            where: {
              schoolId: req.school.id,
              isCurrent: true
            }
          });
          if (currentAcademicYear) {
            historyAcademicYearId = currentAcademicYear.id;
          }
        }
        
        // Only create class history if we have an academic year (either provided or current)
        if (historyAcademicYearId) {
          await prisma.studentClassHistory.create({
            data: {
              studentId: studentId,
              classId: updatedStudent.currentClassId,
              sectionId: updatedStudent.currentSectionId || null,
              schoolId: req.school.id,
              academicYearId: historyAcademicYearId,
              startDate: new Date(),
              status: 'ACTIVE'
            }
          });
        }
      }
    }

    res.json({ success: true, student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'A student with this admission number already exists',
        error: 'Duplicate admission number'
      });
    }

    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find student
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Delete in proper order due to foreign key constraints

    // Delete guardian-student relationships
    await prisma.guardianStudent.deleteMany({
      where: { studentId: studentId }
    });

    // Delete student documents
    await prisma.document.deleteMany({
      where: { studentId: studentId }
    });

    // Delete grades
    await prisma.grade.deleteMany({
      where: { studentId: studentId }
    });

    // Delete attendance records
    await prisma.attendance.deleteMany({
      where: { studentId: studentId }
    });

    // Delete class history records
    await prisma.studentClassHistory.deleteMany({
      where: { studentId: studentId }
    });

    // Delete student
    await prisma.student.delete({
      where: { id: studentId }
    });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get student attendance
exports.getStudentAttendance = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        attendance: {
          orderBy: { date: 'desc' },
          take: 50 // Limit to recent 50 records
        }
      }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, attendance: student.attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get student grades
exports.getStudentGrades = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        grades: {
          include: {
            assessment: {
              include: {
                subject: { select: { name: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, grades: student.grades });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Add or update student guardian
exports.manageGuardian = async (req, res) => {
  try {
    const studentId = req.params.id;
    const guardianData = req.body;

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    let guardian;

    // If guardian has ID, update existing guardian
    if (guardianData.id) {
      guardian = await prisma.guardian.update({
        where: { id: guardianData.id },
        data: {
          firstName: guardianData.firstName,
          lastName: guardianData.lastName,
          middleName: guardianData.middleName || undefined,
          phone: guardianData.phone,
          email: guardianData.email || undefined,
          occupation: guardianData.occupation || undefined
        }
      });
    } else {
      // Check if guardian already exists by phone
      guardian = await prisma.guardian.findFirst({
        where: {
          schoolId: req.school.id,
          phone: guardianData.phone
        }
      });

      // If guardian doesn't exist, create new one
      if (!guardian) {
        guardian = await prisma.guardian.create({
          data: {
            firstName: guardianData.firstName,
            lastName: guardianData.lastName,
            middleName: guardianData.middleName || undefined,
            phone: guardianData.phone,
            email: guardianData.email || undefined,
            occupation: guardianData.occupation || undefined,
            schoolId: req.school.id,
            status: 'ACTIVE'
          }
        });
      }
    }

    // Check if guardian-student relationship already exists
    const existingRelation = await prisma.guardianStudent.findFirst({
      where: {
        guardianId: guardian.id,
        studentId: studentId
      }
    });

    if (!existingRelation) {
      // Create guardian-student relationship
      await prisma.guardianStudent.create({
        data: {
          guardianId: guardian.id,
          studentId: studentId,
          relationship: guardianData.relationship ? guardianData.relationship.toUpperCase() : 'OTHER',
          isPrimary: guardianData.isPrimary || false,
          emergencyContact: guardianData.emergencyContact || false,
          authorizedPickup: guardianData.authorizedPickup || false,
          financialResponsibility: guardianData.financialResponsibility || false
        }
      });
    } else {
      // Update existing relationship
      await prisma.guardianStudent.update({
        where: { id: existingRelation.id },
        data: {
          relationship: guardianData.relationship ? guardianData.relationship.toUpperCase() : 'OTHER',
          isPrimary: guardianData.isPrimary || false,
          emergencyContact: guardianData.emergencyContact || false,
          authorizedPickup: guardianData.authorizedPickup || false,
          financialResponsibility: guardianData.financialResponsibility || false
        }
      });
    }

    res.json({ success: true, guardian });
  } catch (error) {
    console.error('Error managing guardian:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Remove guardian from student
exports.removeGuardian = async (req, res) => {
  try {
    const { id: studentId, guardianId } = req.params;
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Check if guardian exists
    const guardian = await prisma.guardian.findUnique({
      where: { id: guardianId }
    });
    if (!guardian) {
      return res.status(404).json({ success: false, message: 'Guardian not found' });
    }
    
    // Remove guardian-student relationship
    await prisma.guardianStudent.deleteMany({
      where: {
        guardianId: guardianId,
        studentId: studentId
      }
    });
    
    res.json({ success: true, message: 'Guardian removed from student successfully' });
  } catch (error) {
    console.error('Error removing guardian:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Upload document for student
exports.uploadDocument = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { title, category, type, description, fileUrl, fileName, fileType, fileSize } = req.body;
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Create new document
    const document = await prisma.document.create({
      data: {
        studentId: studentId,
        title,
        category: category || 'OTHER',
        type,
        description,
        fileUrl,
        fileName,
        fileType,
        fileSize: fileSize ? parseInt(fileSize) : null,
        uploadedBy: req.user?.id, // Assuming req.user is set by auth middleware
        status: 'ACTIVE'
      }
    });
    
    res.status(201).json({ success: true, document });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get student documents
exports.getStudentDocuments = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get documents
    const documents = await prisma.document.findMany({
      where: { studentId: studentId },
      include: {
        uploadedBy: { select: { name: true } },
        verifiedBy: { select: { name: true } }
      }
    });
    
    res.json({ success: true, documents });
  } catch (error) {
    console.error('Error getting student documents:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { id: studentId, documentId } = req.params;
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Check if document belongs to student
    if (document.studentId !== studentId) {
      return res.status(403).json({ success: false, message: 'Document does not belong to this student' });
    }
    
    // Delete document
    await prisma.document.delete({
      where: { id: documentId }
    });
    
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Verify document
exports.verifyDocument = async (req, res) => {
  try {
    const { id: studentId, documentId } = req.params;
    
    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    // Check if document belongs to student
    if (document.studentId !== studentId) {
      return res.status(403).json({ success: false, message: 'Document does not belong to this student' });
    }
    
    // Update document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        isVerified: true,
        verifiedById: req.user?.id, // Assuming req.user is set by auth middleware
        verificationDate: new Date(),
        status: 'ACTIVE'
      }
    });
    
    res.json({ success: true, document: updatedDocument });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get student class history
exports.getStudentClassHistory = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Get class history
    const history = await prisma.studentClassHistory.findMany({
      where: { studentId: studentId },
      include: {
        class: { select: { name: true, grade: true } },
        academicYear: { select: { name: true, startDate: true, endDate: true } }
      },
      orderBy: { startDate: 'desc' } // Sort by start date (newest first)
    });
    
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error getting student class history:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Upload student profile picture
exports.uploadProfilePicture = async (req, res) => {
  const fileUploadService = require('../utils/fileUploadService');
  
  try {
    const studentId = req.params.id;
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        profilePicture: true
      }
    });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
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
    if (student.profilePicture) {
      try {
        await fileUploadService.deleteFile(student.profilePicture.id);
      } catch (error) {
        console.warn('Warning: Failed to delete old profile picture:', error.message);
        // Continue with upload even if old image deletion fails
      }
    }

    // Upload new profile picture
    const uploadResult = await fileUploadService.uploadProfilePicture(
      req.file.buffer,
      {
        entityId: studentId,
        entityType: 'Student',
        schoolId: student.schoolId,
        uploadedById: req.user?.id,
        fileName: `${student.firstName}_${student.lastName}_profile.jpg`
      }
    );

    // Update student record with new profile picture reference
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        profilePictureId: uploadResult.file.id,
        // Also update the legacy photo field for backward compatibility
        photo: uploadResult.file.fileUrl
      },
      include: {
        profilePicture: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        student: {
          id: updatedStudent.id,
          firstName: updatedStudent.firstName,
          lastName: updatedStudent.lastName,
          profilePictureUrl: updatedStudent.profilePicture?.fileUrl,
          photo: updatedStudent.photo,
          updatedAt: updatedStudent.updatedAt
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
    console.error('Error uploading profile picture:', error);
    
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

// Delete student profile picture
exports.deleteProfilePicture = async (req, res) => {
  const fileUploadService = require('../utils/fileUploadService');
  
  try {
    const studentId = req.params.id;
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        profilePicture: true
      }
    });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Delete profile picture file if exists
    if (student.profilePicture) {
      try {
        await fileUploadService.deleteFile(student.profilePicture.id);
      } catch (error) {
        console.warn('Warning: Failed to delete profile picture file:', error.message);
        // Continue with database update even if file deletion fails
      }
    }

    // Update student record to remove profile picture reference
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        profilePictureId: null,
        photo: null // Also clear legacy field
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profilePictureId: true,
        photo: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: {
        student: updatedStudent
      }
    });

  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred while deleting profile picture',
      error: error.message 
    });
  }
};
