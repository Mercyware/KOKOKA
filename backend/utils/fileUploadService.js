const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');

const prisma = new PrismaClient();

class FileUploadService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.bucket = process.env.AWS_S3_BUCKET_NAME;
    this.publicUrl = process.env.AWS_S3_PUBLIC_URL;
    this.enabled = process.env.AWS_ENABLED === 'true';
  }

  /**
   * Check if AWS S3 is enabled
   */
  isEnabled() {
    return this.enabled && this.bucket && this.s3Client;
  }

  /**
   * Generate a unique file key for S3
   * @param {string} category - File category (PROFILE_PICTURE, DOCUMENT, etc.)
   * @param {string} originalName - Original filename
   * @param {string} schoolId - School ID for organization
   * @returns {string} S3 object key
   */
  generateFileKey(category, originalName, schoolId) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName).toLowerCase();
    const sanitizedName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .toLowerCase();

    const categoryPath = category.toLowerCase().replace('_', '-');
    return `${schoolId}/${categoryPath}/${timestamp}_${randomString}_${sanitizedName}${extension}`;
  }

  /**
   * Optimize image before upload
   * @param {Buffer} imageBuffer - Original image buffer
   * @param {Object} options - Optimization options
   * @returns {Promise<Buffer>} Optimized image buffer
   */
  async optimizeImage(imageBuffer, options = {}) {
    const {
      width = parseInt(process.env.IMAGE_MAX_WIDTH) || 1200,
      height = parseInt(process.env.IMAGE_MAX_HEIGHT) || 1200,
      quality = parseInt(process.env.IMAGE_QUALITY) || 80,
      format = 'jpeg'
    } = options;

    let sharp_instance = sharp(imageBuffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });

    // Convert to specified format
    if (format === 'webp') {
      sharp_instance = sharp_instance.webp({ quality });
    } else {
      sharp_instance = sharp_instance.jpeg({ quality });
    }

    return await sharp_instance.toBuffer();
  }

  /**
   * Upload file to S3 and create FileManager record
   * @param {Buffer} fileData - File data buffer
   * @param {Object} fileInfo - File information
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} FileManager record
   */
  async uploadFile(fileData, fileInfo, metadata = {}) {
    if (!this.isEnabled()) {
      throw new Error('AWS S3 upload service is not enabled or configured');
    }

    const {
      fileName,
      originalName,
      mimeType,
      category = 'OTHER',
      entityType,
      entityId,
      schoolId,
      uploadedById,
      isPublic = false,
      description,
      tags = []
    } = fileInfo;

    try {
      // Generate unique S3 key
      const fileKey = this.generateFileKey(category, originalName || fileName, schoolId);

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        Body: fileData,
        ContentType: mimeType,
        ACL: isPublic ? 'public-read' : 'private', // Set ACL based on isPublic flag
        Metadata: {
          ...metadata,
          originalName: originalName || fileName,
          schoolId,
          entityType: entityType || '',
          entityId: entityId || '',
          uploadedBy: uploadedById || '',
          isPublic: isPublic.toString()
        }
      });

      await this.s3Client.send(command);

      // Generate public URL
      const fileUrl = this.getPublicUrl(fileKey);

      // Get file dimensions if it's an image
      let dimensions = null;
      let compressed = false;
      if (mimeType.startsWith('image/')) {
        try {
          const imageMetadata = await sharp(fileData).metadata();
          dimensions = {
            width: imageMetadata.width,
            height: imageMetadata.height
          };
        } catch (error) {
          console.warn('Could not extract image dimensions:', error.message);
        }
      }

      // Create FileManager record
      const fileRecord = await prisma.fileManager.create({
        data: {
          fileName,
          fileKey,
          fileUrl,
          fileSize: fileData.length,
          mimeType,
          category,
          originalName,
          dimensions,
          compressed,
          entityType,
          entityId,
          uploadedById,
          schoolId,
          status: 'ACTIVE',
          isPublic,
          description,
          tags
        }
      });

      return {
        success: true,
        file: fileRecord,
        key: fileKey,
        url: fileUrl
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload profile picture with optimization
   * @param {Buffer} imageBuffer - Image buffer
   * @param {Object} profileInfo - Profile information
   * @returns {Promise<Object>} FileManager record
   */
  async uploadProfilePicture(imageBuffer, profileInfo) {
    try {
      const {
        entityId, // Student ID, Teacher ID, etc.
        entityType = 'Student',
        schoolId,
        uploadedById,
        fileName = 'profile-picture.jpg'
      } = profileInfo;

      // Optimize the image for profile picture
      const optimizedImage = await this.optimizeImage(imageBuffer, {
        width: 400,
        height: 400,
        quality: 85,
        format: 'jpeg'
      });

      const fileInfo = {
        fileName,
        originalName: fileName,
        mimeType: 'image/jpeg',
        category: 'PROFILE_PICTURE',
        entityType,
        entityId,
        schoolId,
        uploadedById,
        isPublic: true,
        description: `Profile picture for ${entityType.toLowerCase()} ${entityId}`,
        tags: ['profile', 'picture', entityType.toLowerCase()]
      };

      return await this.uploadFile(optimizedImage, fileInfo, {
        optimized: 'true',
        originalFormat: 'auto',
        compressionQuality: '85'
      });
    } catch (error) {
      console.error('Profile picture upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file from S3 and update FileManager record
   * @param {string} fileId - FileManager ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(fileId) {
    try {
      // Get file record
      const fileRecord = await prisma.fileManager.findUnique({
        where: { id: fileId }
      });

      if (!fileRecord) {
        throw new Error('File not found');
      }

      // Delete from S3 if enabled
      if (this.isEnabled()) {
        try {
          const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: fileRecord.fileKey
          });
          await this.s3Client.send(command);
        } catch (s3Error) {
          console.warn('S3 deletion failed:', s3Error.message);
          // Continue with database update even if S3 deletion fails
        }
      }

      // Update FileManager record status
      await prisma.fileManager.update({
        where: { id: fileId },
        data: {
          status: 'DELETED'
        }
      });

      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get file by ID
   * @param {string} fileId - FileManager ID
   * @returns {Promise<Object>} FileManager record
   */
  async getFile(fileId) {
    return await prisma.fileManager.findUnique({
      where: { id: fileId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Get files by entity
   * @param {string} entityType - Entity type (Student, Teacher, etc.)
   * @param {string} entityId - Entity ID
   * @param {string} category - File category (optional)
   * @returns {Promise<Array>} FileManager records
   */
  async getFilesByEntity(entityType, entityId, category = null) {
    const where = {
      entityType,
      entityId,
      status: 'ACTIVE'
    };

    if (category) {
      where.category = category;
    }

    return await prisma.fileManager.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Get public URL for file
   * @param {string} fileKey - S3 object key
   * @returns {string} Public URL
   */
  getPublicUrl(fileKey) {
    if (this.publicUrl) {
      return `${this.publicUrl}/${fileKey}`;
    }
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  }

  /**
   * Validate image file
   * @param {Buffer} imageBuffer - Image buffer to validate
   * @param {Object} constraints - Validation constraints
   * @returns {Promise<Object>} Validation result
   */
  async validateImage(imageBuffer, constraints = {}) {
    const {
      maxSize = parseInt(process.env.IMAGE_MAX_SIZE) || 5242880, // 5MB
      allowedTypes = (process.env.IMAGE_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp').split(','),
      minWidth = 100,
      minHeight = 100,
      maxWidth = parseInt(process.env.IMAGE_MAX_WIDTH) || 1200,
      maxHeight = parseInt(process.env.IMAGE_MAX_HEIGHT) || 1200
    } = constraints;

    try {
      // Check file size
      if (imageBuffer.length > maxSize) {
        return {
          valid: false,
          error: `File size ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSize / 1024 / 1024).toFixed(2)}MB`
        };
      }

      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();

      // Check format
      if (!allowedTypes.includes(`image/${metadata.format}`)) {
        return {
          valid: false,
          error: `Image format ${metadata.format} is not allowed. Allowed formats: ${allowedTypes.join(', ')}`
        };
      }

      // Check dimensions
      if (metadata.width < minWidth || metadata.height < minHeight) {
        return {
          valid: false,
          error: `Image dimensions ${metadata.width}x${metadata.height} are too small. Minimum: ${minWidth}x${minHeight}`
        };
      }

      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        return {
          valid: false,
          error: `Image dimensions ${metadata.width}x${metadata.height} are too large. Maximum: ${maxWidth}x${maxHeight}`
        };
      }

      return {
        valid: true,
        metadata: {
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          size: imageBuffer.length,
          channels: metadata.channels
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid image file or corrupted data'
      };
    }
  }

  /**
   * Update file metadata
   * @param {string} fileId - FileManager ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated FileManager record
   */
  async updateFile(fileId, updates) {
    const allowedUpdates = ['fileName', 'description', 'tags', 'isPublic', 'status'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    return await prisma.fileManager.update({
      where: { id: fileId },
      data: filteredUpdates
    });
  }

  /**
   * Get file statistics for a school
   * @param {string} schoolId - School ID
   * @returns {Promise<Object>} File statistics
   */
  async getFileStats(schoolId) {
    const stats = await prisma.fileManager.groupBy({
      by: ['category', 'status'],
      where: { schoolId },
      _count: {
        id: true
      },
      _sum: {
        fileSize: true
      }
    });

    return stats.reduce((acc, stat) => {
      const key = `${stat.category}_${stat.status}`;
      acc[key] = {
        count: stat._count.id,
        totalSize: stat._sum.fileSize || 0
      };
      return acc;
    }, {});
  }
}

// Create singleton instance
const fileUploadService = new FileUploadService();

module.exports = fileUploadService;