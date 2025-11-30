const { prisma } = require('../../config/database');
const AIProviderFactory = require('./AIProviderFactory');
const logger = require('../../utils/logger');

/**
 * TopicMasteryService
 * AI-powered analysis of student mastery on topics and concepts
 */
class TopicMasteryService {
  constructor() {
    this.aiProvider = null;
  }

  async getAIProvider() {
    if (!this.aiProvider) {
      this.aiProvider = await AIProviderFactory.getProvider();
    }
    return this.aiProvider;
  }

  /**
   * Analyze student's mastery of a concept with AI insights
   */
  async analyzeConceptMastery(studentId, conceptId) {
    try {
      const mastery = await prisma.studentConceptMastery.findUnique({
        where: {
          studentId_conceptId: {
            studentId,
            conceptId
          }
        },
        include: {
          concept: {
            include: {
              topic: true
            }
          },
          evidence: {
            orderBy: { timestamp: 'desc' },
            take: 10
          },
          student: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!mastery) {
        return {
          masteryLevel: 0,
          status: 'NOVICE',
          analysis: 'No evidence recorded yet'
        };
      }

      // Prepare data for AI analysis
      const evidenceSummary = mastery.evidence.map(ev => ({
        type: ev.sourceType,
        score: ev.score,
        maxScore: ev.maxScore,
        percentage: ((ev.score / ev.maxScore) * 100).toFixed(1),
        date: ev.timestamp
      }));

      const prompt = `Analyze this student's mastery of a learning concept:

Student: ${mastery.student.firstName} ${mastery.student.lastName}
Concept: ${mastery.concept.name}
Topic: ${mastery.concept.topic.name}
Current Mastery Level: ${mastery.masteryLevel.toFixed(1)}%
Status: ${mastery.status}
Trend: ${mastery.trend || 'STABLE'}

Recent Evidence:
${evidenceSummary.map(ev => `- ${ev.type}: ${ev.score}/${ev.maxScore} (${ev.percentage}%) on ${ev.date}`).join('\n')}

Provide a concise analysis in JSON format:
{
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["specific weakness 1", "specific weakness 2"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
  "nextSteps": "Brief next step guidance",
  "estimatedTimeToMastery": "time estimate (e.g., '2-3 weeks')"
}`;

      const aiProvider = await this.getAIProvider();
      const analysis = await aiProvider.chat([
        { role: 'system', content: 'You are an educational assessment expert analyzing student performance data.' },
        { role: 'user', content: prompt }
      ]);

      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(analysis);
      } catch {
        parsedAnalysis = {
          strengths: ['Shows engagement with the material'],
          weaknesses: ['Needs more practice'],
          recommendations: ['Continue regular practice', 'Review foundational concepts'],
          nextSteps: 'Focus on consistent practice and seek help when needed',
          estimatedTimeToMastery: '2-4 weeks'
        };
      }

      return {
        masteryLevel: mastery.masteryLevel,
        status: mastery.status,
        trend: mastery.trend,
        evidenceCount: mastery.evidenceCount,
        lastAssessed: mastery.lastAssessed,
        ...parsedAnalysis
      };
    } catch (error) {
      logger.error(`Error analyzing concept mastery: ${error.message}`);
      throw error;
    }
  }

  /**
   * Predict difficulty of a topic for a student based on their current mastery
   */
  async predictTopicDifficulty(studentId, topicId) {
    try {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: {
          concepts: true,
          curriculumSubject: {
            include: {
              subject: true
            }
          }
        }
      });

      if (!topic) {
        throw new Error('Topic not found');
      }

      // Get student's mastery on related concepts/topics
      const studentProgress = await prisma.studentConceptMastery.findMany({
        where: {
          studentId,
          concept: {
            topic: {
              curriculumSubjectId: topic.curriculumSubjectId
            }
          }
        },
        include: {
          concept: {
            include: {
              topic: true
            }
          }
        }
      });

      const averageMastery = studentProgress.length > 0
        ? studentProgress.reduce((sum, p) => sum + p.masteryLevel, 0) / studentProgress.length
        : 0;

      const prompt = `Predict the difficulty of a new topic for this student:

Topic: ${topic.name}
Subject: ${topic.curriculumSubject.subject.name}
Topic Difficulty Level: ${topic.difficultyLevel || 'INTERMEDIATE'}
Estimated Hours: ${topic.estimatedHours || 'Not specified'}

Student's Performance in Subject:
- Average mastery in related topics: ${averageMastery.toFixed(1)}%
- Topics completed: ${studentProgress.length}

Concepts in this topic:
${topic.concepts.map(c => `- ${c.name} (${c.bloomsLevel})`).join('\n')}

Provide prediction in JSON format:
{
  "difficultyScore": 0-100 (0=very easy, 100=very hard for this student),
  "prerequisiteGaps": ["gap 1", "gap 2"],
  "estimatedCompletionTime": "time estimate",
  "confidenceLevel": "LOW|MEDIUM|HIGH",
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

      const aiProvider = await this.getAIProvider();
      const prediction = await aiProvider.chat([
        { role: 'system', content: 'You are an educational psychologist predicting learning difficulty.' },
        { role: 'user', content: prompt }
      ]);

      let parsedPrediction;
      try {
        parsedPrediction = JSON.parse(prediction);
      } catch {
        parsedPrediction = {
          difficultyScore: 50,
          prerequisiteGaps: [],
          estimatedCompletionTime: `${topic.estimatedHours || 10} hours`,
          confidenceLevel: 'MEDIUM',
          recommendations: ['Approach with regular practice', 'Seek help early if struggling']
        };
      }

      return {
        topic: {
          id: topic.id,
          name: topic.name,
          estimatedHours: topic.estimatedHours
        },
        studentAverageMastery: averageMastery,
        ...parsedPrediction
      };
    } catch (error) {
      logger.error(`Error predicting topic difficulty: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate personalized learning path for a student in a subject
   */
  async generateLearningPath(studentId, subjectId, curriculumSubjectId) {
    try {
      // Get all topics in the subject
      const topics = await prisma.topic.findMany({
        where: { curriculumSubjectId },
        include: {
          concepts: true,
          studentTopicProgress: {
            where: { studentId }
          }
        },
        orderBy: { displayOrder: 'asc' }
      });

      // Get student's concept mastery
      const conceptMastery = await prisma.studentConceptMastery.findMany({
        where: {
          studentId,
          concept: {
            topic: {
              curriculumSubjectId
            }
          }
        },
        include: {
          concept: true
        }
      });

      // Categorize topics
      const notStarted = topics.filter(t => !t.studentTopicProgress.length || t.studentTopicProgress[0].status === 'NOT_STARTED');
      const inProgress = topics.filter(t => t.studentTopicProgress.length && t.studentTopicProgress[0].status === 'IN_PROGRESS');
      const struggling = topics.filter(t => t.studentTopicProgress.length && t.studentTopicProgress[0].status === 'STRUGGLING');
      const mastered = topics.filter(t => t.studentTopicProgress.length && t.studentTopicProgress[0].status === 'MASTERED');

      const weakConcepts = conceptMastery
        .filter(m => m.masteryLevel < 60)
        .map(m => m.concept.name);

      const prompt = `Create a personalized learning path for this student:

Subject: ${topics[0]?.curriculumSubject?.subject?.name || 'Unknown'}

Student Status:
- Topics not started: ${notStarted.length}
- Topics in progress: ${inProgress.length}
- Topics struggling: ${struggling.length}
- Topics mastered: ${mastered.length}

Weak concepts to review:
${weakConcepts.slice(0, 5).join(', ') || 'None identified'}

Available topics:
${topics.map((t, i) => `${i + 1}. ${t.name} (${t.estimatedHours}h, ${t.difficultyLevel})`).join('\n')}

Create a learning path in JSON format:
{
  "recommendedSequence": [
    {
      "topicName": "topic name",
      "priority": "HIGH|MEDIUM|LOW",
      "reason": "why this topic now",
      "estimatedWeeks": 2
    }
  ],
  "focusAreas": ["area 1", "area 2"],
  "reviewTopics": ["topic to review"],
  "milestones": [
    {
      "week": 4,
      "goal": "milestone description"
    }
  ]
}

Limit to next 6-8 topics.`;

      const aiProvider = await this.getAIProvider();
      const path = await aiProvider.chat([
        { role: 'system', content: 'You are an educational curriculum designer creating personalized learning paths.' },
        { role: 'user', content: prompt }
      ]);

      let parsedPath;
      try {
        parsedPath = JSON.parse(path);
      } catch {
        parsedPath = {
          recommendedSequence: notStarted.slice(0, 6).map(t => ({
            topicName: t.name,
            priority: 'MEDIUM',
            reason: 'Next in sequence',
            estimatedWeeks: Math.ceil((t.estimatedHours || 10) / 5)
          })),
          focusAreas: ['Regular practice', 'Consistent review'],
          reviewTopics: [],
          milestones: []
        };
      }

      return {
        studentId,
        subjectId,
        generatedAt: new Date(),
        statistics: {
          totalTopics: topics.length,
          notStarted: notStarted.length,
          inProgress: inProgress.length,
          struggling: struggling.length,
          mastered: mastered.length
        },
        ...parsedPath
      };
    } catch (error) {
      logger.error(`Error generating learning path: ${error.message}`);
      throw error;
    }
  }

  /**
   * Identify knowledge gaps for a student in a topic
   */
  async identifyKnowledgeGaps(studentId, topicId) {
    try {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: {
          concepts: {
            include: {
              studentConceptMastery: {
                where: { studentId }
              }
            }
          },
          parentTopic: true
        }
      });

      if (!topic) {
        throw new Error('Topic not found');
      }

      // Identify weak concepts
      const gaps = topic.concepts
        .filter(c => {
          const mastery = c.studentConceptMastery[0];
          return !mastery || mastery.masteryLevel < 60;
        })
        .map(c => ({
          conceptName: c.name,
          bloomsLevel: c.bloomsLevel,
          currentMastery: c.studentConceptMastery[0]?.masteryLevel || 0,
          status: c.studentConceptMastery[0]?.status || 'NOT_ASSESSED'
        }));

      return {
        topicId,
        topicName: topic.name,
        totalConcepts: topic.concepts.length,
        gaps,
        gapCount: gaps.length,
        percentageComplete: ((topic.concepts.length - gaps.length) / topic.concepts.length * 100).toFixed(1),
        needsPrerequisiteReview: gaps.some(g => g.bloomsLevel === 'REMEMBER' || g.bloomsLevel === 'UNDERSTAND')
      };
    } catch (error) {
      logger.error(`Error identifying knowledge gaps: ${error.message}`);
      throw error;
    }
  }

  /**
   * Auto-tag assignment questions with relevant concepts using AI
   */
  async autoTagAssignment(assignmentText, subjectId) {
    try {
      // Get all concepts for the subject
      const concepts = await prisma.concept.findMany({
        where: {
          topic: {
            curriculumSubject: {
              subjectId
            }
          }
        },
        include: {
          topic: {
            include: {
              curriculumSubject: {
                include: {
                  subject: true
                }
              }
            }
          }
        }
      });

      if (concepts.length === 0) {
        return { conceptIds: [], confidence: 0 };
      }

      const conceptList = concepts.map((c, i) =>
        `${i + 1}. ${c.name} (Topic: ${c.topic.name}, Bloom's: ${c.bloomsLevel}) - ID: ${c.id}`
      ).join('\n');

      const prompt = `Tag this assignment with relevant learning concepts:

Subject: ${concepts[0].topic.curriculumSubject.subject.name}

Assignment Text:
${assignmentText.substring(0, 1000)}

Available Concepts:
${conceptList}

Return JSON with concept IDs and confidence:
{
  "tags": [
    {
      "conceptId": "uuid",
      "conceptName": "name",
      "confidence": 0.95,
      "reasoning": "why this concept applies"
    }
  ]
}

Only include concepts with confidence > 0.7.`;

      const aiProvider = await this.getAIProvider();
      const tagging = await aiProvider.chat([
        { role: 'system', content: 'You are an expert at mapping educational content to learning objectives.' },
        { role: 'user', content: prompt }
      ]);

      let parsedTags;
      try {
        parsedTags = JSON.parse(tagging);
      } catch {
        parsedTags = { tags: [] };
      }

      return {
        conceptIds: parsedTags.tags.map(t => t.conceptId),
        tags: parsedTags.tags,
        totalConcepts: concepts.length
      };
    } catch (error) {
      logger.error(`Error auto-tagging assignment: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new TopicMasteryService();
