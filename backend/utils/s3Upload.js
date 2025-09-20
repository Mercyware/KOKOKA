const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');

class S3UploadService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      },
    });

    this.bucket = process.env.AWS_S3_BUCKET_NAME;
    this.cdnUrl = process.env.AWS_S3_CDN_URL;
    this.publicUrl = process.env.AWS_S3_PUBLIC_URL;
    this.enabled = process.env.AWS_S3_ENABLED === 'true';
  }

  /**
   * Check if S3 is enabled
   */
  isEnabled() {
    return this.enabled && this.bucket && this.s3Client;
  }

  /**
   * Generate a unique file key for S3
   * @param {string} prefix - File prefix (e.g., 'students/profile-pictures')
   * @param {string} originalName - Original filename
   * @param {string} schoolId - School ID for organization
   * @returns {string} S3 object key
   */
  generateFileKey(prefix, originalName, schoolId) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName).toLowerCase();
    const sanitizedName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .toLowerCase();

    return `${schoolId}/${prefix}/${timestamp}_${randomString}_${sanitizedName}${extension}`;
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
      format = 'jpeg' // or 'webp'
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
   * Upload file to S3
   * @param {Buffer|string} fileData - File data (buffer or file path)
   * @param {string} key - S3 object key
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result with URL and key
   */
  async uploadFile(fileData, key, options = {}) {
    if (!this.isEnabled()) {
      throw new Error('S3 upload service is not enabled or configured');
    }

    const {
      contentType = 'application/octet-stream',
      acl = 'public-read',
      metadata = {}
    } = options;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileData,
        ContentType: contentType,
        ACL: acl,
        Metadata: metadata
      });

      await this.s3Client.send(command);

      const publicUrl = this.getPublicUrl(key);
      const cdnUrl = this.getCdnUrl(key);

      return {
        success: true,
        key,
        publicUrl,
        cdnUrl: cdnUrl || publicUrl,
        bucket: this.bucket
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Upload profile picture with optimization
   * @param {Buffer} imageBuffer - Image buffer
   * @param {string} studentId - Student ID
   * @param {string} schoolId - School ID
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadProfilePicture(imageBuffer, studentId, schoolId, options = {}) {
    try {
      // Optimize the image
      const optimizedImage = await this.optimizeImage(imageBuffer, {
        width: 400,
        height: 400,
        quality: 85,
        format: 'jpeg',
        ...options
      });

      // Generate unique key
      const key = this.generateFileKey(
        'students/profile-pictures',
        `${studentId}_profile.jpg`,
        schoolId
      );

      // Upload to S3
      return await this.uploadFile(optimizedImage, key, {
        contentType: 'image/jpeg',
        metadata: {
          studentId,
          schoolId,
          uploadType: 'profile-picture',
          optimized: 'true'
        }
      });
    } catch (error) {
      console.error('Profile picture upload error:', error);
      throw error;
    }
  }

  /**
   * Delete file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(key) {
    if (!this.isEnabled()) {
      console.warn('S3 delete service is not enabled, skipping deletion');
      return false;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Get public URL for S3 object
   * @param {string} key - S3 object key
   * @returns {string} Public URL
   */
  getPublicUrl(key) {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return `https://${this.bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
  }

  /**
   * Get CDN URL for S3 object (if CloudFront is configured)
   * @param {string} key - S3 object key
   * @returns {string|null} CDN URL or null if not configured
   */
  getCdnUrl(key) {
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${key}`;
    }
    return null;
  }

  /**
   * Check if file exists in S3
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>} Exists status
   */
  async fileExists(key) {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata from S3
   * @param {string} key - S3 object key
   * @returns {Promise<Object>} File metadata
   */
  async getFileMetadata(key) {
    if (!this.isEnabled()) {
      throw new Error('S3 service is not enabled');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const response = await this.s3Client.send(command);
      
      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata
      };
    } catch (error) {
      console.error('S3 metadata retrieval error:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
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
}

// Create singleton instance
const s3UploadService = new S3UploadService();

module.exports = s3UploadService;