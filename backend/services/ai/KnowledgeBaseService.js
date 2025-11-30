const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Knowledge Base Service
 * Manages FAQ database for chatbot training and fallback
 */
class KnowledgeBaseService {
  /**
   * Search knowledge base for relevant answers
   * @param {String} query - User query
   * @param {String} schoolId - School ID (optional, for school-specific KB)
   * @param {Number} limit - Maximum results to return
   * @returns {Promise<Array>} - Array of matching KB entries
   */
  async search(query, schoolId = null, limit = 5) {
    try {
      const keywords = this.extractKeywords(query);

      // Search by keywords and question similarity
      const results = await prisma.knowledgeBase.findMany({
        where: {
          isActive: true,
          OR: [
            {
              schoolId: schoolId, // School-specific KB
            },
            {
              schoolId: null, // Global KB
            },
          ],
          OR: [
            {
              keywords: {
                hasSome: keywords,
              },
            },
            {
              question: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              answer: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: [
          { priority: 'desc' },
          { helpfulCount: 'desc' },
          { views: 'desc' },
        ],
        take: limit,
      });

      // Update view counts
      const ids = results.map((r) => r.id);
      if (ids.length > 0) {
        await prisma.knowledgeBase.updateMany({
          where: { id: { in: ids } },
          data: { views: { increment: 1 } },
        });
      }

      return results;
    } catch (error) {
      console.error('Knowledge base search error:', error);
      return [];
    }
  }

  /**
   * Get KB entry by ID
   */
  async getById(id) {
    return prisma.knowledgeBase.findUnique({
      where: { id },
    });
  }

  /**
   * Create new KB entry
   */
  async create(data) {
    return prisma.knowledgeBase.create({
      data: {
        category: data.category,
        question: data.question,
        answer: data.answer,
        keywords: data.keywords || [],
        relatedQuestions: data.relatedQuestions || [],
        metadata: data.metadata || {},
        priority: data.priority || 0,
        schoolId: data.schoolId || null,
      },
    });
  }

  /**
   * Update KB entry
   */
  async update(id, data) {
    return prisma.knowledgeBase.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete KB entry
   */
  async delete(id) {
    return prisma.knowledgeBase.delete({
      where: { id },
    });
  }

  /**
   * Mark KB entry as helpful/not helpful
   */
  async rateFeedback(id, helpful) {
    const field = helpful ? 'helpfulCount' : 'notHelpfulCount';
    return prisma.knowledgeBase.update({
      where: { id },
      data: {
        [field]: { increment: 1 },
      },
    });
  }

  /**
   * Get KB entries by category
   */
  async getByCategory(category, schoolId = null) {
    return prisma.knowledgeBase.findMany({
      where: {
        category,
        isActive: true,
        OR: [{ schoolId }, { schoolId: null }],
      },
      orderBy: { priority: 'desc' },
    });
  }

  /**
   * Get all categories
   */
  async getCategories(schoolId = null) {
    const results = await prisma.knowledgeBase.groupBy({
      by: ['category'],
      where: {
        isActive: true,
        OR: [{ schoolId }, { schoolId: null }],
      },
      _count: true,
    });

    return results.map((r) => ({
      category: r.category,
      count: r._count,
    }));
  }

  /**
   * Get suggested questions
   */
  async getSuggestedQuestions(limit = 10, schoolId = null) {
    return prisma.knowledgeBase.findMany({
      where: {
        isActive: true,
        OR: [{ schoolId }, { schoolId: null }],
      },
      orderBy: [{ priority: 'desc' }, { views: 'desc' }],
      take: limit,
      select: {
        id: true,
        question: true,
        category: true,
      },
    });
  }

  /**
   * Extract keywords from query
   */
  extractKeywords(query) {
    // Simple keyword extraction - remove common words
    const stopWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'were',
      'been',
      'be',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'should',
      'could',
      'can',
      'may',
      'might',
      'what',
      'when',
      'where',
      'why',
      'how',
      'which',
      'who',
      'whom',
    ];

    const words = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word));

    return words;
  }

  /**
   * Get analytics for KB
   */
  async getAnalytics(schoolId = null) {
    const total = await prisma.knowledgeBase.count({
      where: {
        OR: [{ schoolId }, { schoolId: null }],
      },
    });

    const active = await prisma.knowledgeBase.count({
      where: {
        isActive: true,
        OR: [{ schoolId }, { schoolId: null }],
      },
    });

    const topQuestions = await prisma.knowledgeBase.findMany({
      where: {
        isActive: true,
        OR: [{ schoolId }, { schoolId: null }],
      },
      orderBy: { views: 'desc' },
      take: 10,
      select: {
        question: true,
        views: true,
        helpfulCount: true,
        notHelpfulCount: true,
      },
    });

    return {
      total,
      active,
      inactive: total - active,
      topQuestions,
    };
  }

  /**
   * Bulk import KB entries
   */
  async bulkImport(entries) {
    return prisma.knowledgeBase.createMany({
      data: entries,
      skipDuplicates: true,
    });
  }
}

module.exports = new KnowledgeBaseService();
