const express = require('express');
const router = express.Router();
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../utils/logger');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Serve image from S3 through backend proxy
 * This allows serving private S3 objects without making them publicly accessible
 * @route GET /api/images/:schoolId/:type/:filename
 */
router.get('/:schoolId/:type/:filename', async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    const { schoolId, type, filename } = req.params;
    
    // Validate school access (optional - could check if user has access to this school)
    // if (req.school && req.school.id !== schoolId) {
    //   return res.status(403).json({ success: false, message: 'Access denied' });
    // }

    // Construct S3 key based on the file structure
    let s3Key;
    if (type === 'profile-pictures') {
      s3Key = `${schoolId}/students/profile-pictures/${filename}`;
    } else if (type === 'school-logo') {
      s3Key = `${schoolId}/school-logo/${filename}`;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid image type' });
    }

    // Get object from S3
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key
    });

    const response = await s3Client.send(command);

    // Set appropriate headers
    res.setHeader('Content-Type', response.ContentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('ETag', response.ETag);

    // Stream the image
    response.Body.pipe(res);

  } catch (error) {
    logger.error('Image proxy error:', error);
    
    if (error.name === 'NoSuchKey') {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    res.status(500).json({ success: false, message: 'Failed to retrieve image' });
  }
});

/**
 * Alternative route for direct S3 key access
 * @route GET /api/images/s3/:key
 */
router.get('/s3/:key(*)', async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    const s3Key = req.params.key;
    
    // Basic validation - ensure key contains school ID pattern
    if (!s3Key.match(/^[a-f0-9-]{36}\//)) {
      return res.status(400).json({ success: false, message: 'Invalid image key format' });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key
    });

    const response = await s3Client.send(command);

    // Set appropriate headers
    res.setHeader('Content-Type', response.ContentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('ETag', response.ETag);

    // Stream the image
    response.Body.pipe(res);

  } catch (error) {
    logger.error('S3 proxy error:', error);
    
    if (error.name === 'NoSuchKey') {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    res.status(500).json({ success: false, message: 'Failed to retrieve image' });
  }
});

module.exports = router;