const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all message threads for the current user
exports.getThreads = async (req, res) => {
  try {
    // Check if messaging models exist
    if (!prisma.messageThread) {
      return res.status(500).json({
        success: false,
        message: 'Messaging module not initialized',
        error: 'Please run: npx prisma migrate dev --name add_messaging_module && npx prisma generate'
      });
    }

    const userId = req.user.id;
    const { page = 1, limit = 20, type, status, search } = req.query;

    const where = {
      schoolId: req.school.id,
      participants: {
        some: {
          userId,
          status: 'ACTIVE',
        },
      },
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { groupName: { contains: search, mode: 'insensitive' } },
        { lastMessagePreview: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [threads, total] = await Promise.all([
      prisma.messageThread.findMany({
        where,
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  profileImage: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.messageThread.count({ where }),
    ]);

    // Get unread count for current user
    const threadsWithUnread = await Promise.all(
      threads.map(async (thread) => {
        const participant = thread.participants.find(p => p.userId === userId);
        return {
          ...thread,
          unreadCount: participant?.unreadCount || 0,
          isMuted: participant?.isMuted || false,
          isPinned: participant?.isPinned || false,
        };
      })
    );

    res.json({
      success: true,
      threads: threadsWithUnread,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get a specific thread with messages
exports.getThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant
    const participant = await prisma.messageThreadParticipant.findFirst({
      where: {
        threadId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!participant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [thread, messages, total] = await Promise.all([
      prisma.messageThread.findUnique({
        where: { id: threadId },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      }),
      prisma.message.findMany({
        where: { threadId, isDeleted: false },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          recipients: {
            where: { recipientId: userId },
            select: {
              isRead: true,
              readAt: true,
              isStarred: true,
            },
          },
          parentMessage: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: { replies: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.message.count({ where: { threadId, isDeleted: false } }),
    ]);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Mark messages as read
    await prisma.messageRecipient.updateMany({
      where: {
        recipientId: userId,
        message: { threadId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
        deliveryStatus: 'READ',
      },
    });

    // Update participant's unread count and last read time
    await prisma.messageThreadParticipant.update({
      where: { id: participant.id },
      data: {
        unreadCount: 0,
        lastReadAt: new Date(),
      },
    });

    res.json({
      success: true,
      thread,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create a new thread
exports.createThread = async (req, res) => {
  try {
    const { subject, type, participantIds, groupName, message, isGroup } = req.body;
    const userId = req.user.id;

    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one participant is required' });
    }

    // Check for existing direct thread between same participants
    if (type === 'DIRECT' && participantIds.length === 1) {
      const existingThread = await prisma.messageThread.findFirst({
        where: {
          schoolId: req.school.id,
          type: 'DIRECT',
          isGroup: false,
          participants: {
            every: {
              userId: { in: [userId, participantIds[0]] },
            },
          },
        },
        include: {
          participants: true,
        },
      });

      if (existingThread && existingThread.participants.length === 2) {
        return res.status(400).json({
          success: false,
          message: 'Thread already exists',
          threadId: existingThread.id,
        });
      }
    }

    // Create thread
    const thread = await prisma.messageThread.create({
      data: {
        subject,
        type: type || 'DIRECT',
        isGroup: isGroup || participantIds.length > 1,
        groupName: groupName || null,
        status: 'ACTIVE',
        schoolId: req.school.id,
        createdById: userId,
        lastMessageAt: message ? new Date() : null,
        lastMessagePreview: message ? message.substring(0, 100) : null,
      },
    });

    // Add participants (including creator)
    const allParticipants = [userId, ...participantIds];
    const uniqueParticipants = [...new Set(allParticipants)];

    await prisma.messageThreadParticipant.createMany({
      data: uniqueParticipants.map((pId, index) => ({
        threadId: thread.id,
        userId: pId,
        isAdmin: pId === userId,
        unreadCount: pId === userId ? 0 : 1,
      })),
    });

    // Send initial message if provided
    let createdMessage = null;
    if (message) {
      createdMessage = await prisma.message.create({
        data: {
          threadId: thread.id,
          content: message,
          messageType: 'TEXT',
          priority: 'NORMAL',
          senderId: userId,
          schoolId: req.school.id,
        },
      });

      // Create recipient records
      const recipientIds = participantIds.filter(id => id !== userId);
      if (recipientIds.length > 0) {
        await prisma.messageRecipient.createMany({
          data: recipientIds.map(recipientId => ({
            messageId: createdMessage.id,
            recipientId,
            isRead: false,
            deliveryStatus: 'DELIVERED',
          })),
        });
      }
    }

    const fullThread = await prisma.messageThread.findUnique({
      where: { id: thread.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileImage: true,
              },
            },
          },
        },
        messages: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      thread: fullThread,
    });
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Send a message in a thread
exports.sendMessage = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content, messageType, priority, isImportant, attachments, parentMessageId } = req.body;
    const userId = req.user.id;

    // Check if user is participant
    const participant = await prisma.messageThreadParticipant.findFirst({
      where: {
        threadId,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!participant) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get all other participants
    const otherParticipants = await prisma.messageThreadParticipant.findMany({
      where: {
        threadId,
        userId: { not: userId },
        status: 'ACTIVE',
      },
    });

    // Create message
    const message = await prisma.message.create({
      data: {
        threadId,
        content,
        messageType: messageType || 'TEXT',
        priority: priority || 'NORMAL',
        isImportant: isImportant || false,
        attachments: attachments || null,
        parentMessageId: parentMessageId || null,
        senderId: userId,
        schoolId: req.school.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    // Create recipient records
    if (otherParticipants.length > 0) {
      await prisma.messageRecipient.createMany({
        data: otherParticipants.map(p => ({
          messageId: message.id,
          recipientId: p.userId,
          isRead: false,
          deliveryStatus: 'DELIVERED',
        })),
      });

      // Increment unread count for other participants
      await prisma.messageThreadParticipant.updateMany({
        where: {
          threadId,
          userId: { not: userId },
          status: 'ACTIVE',
        },
        data: {
          unreadCount: { increment: 1 },
        },
      });
    }

    // Update thread's last message info
    await prisma.messageThread.update({
      where: { id: threadId },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const recipient = await prisma.messageRecipient.findFirst({
      where: {
        messageId,
        recipientId: userId,
      },
    });

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    await prisma.messageRecipient.update({
      where: { id: recipient.id },
      data: {
        isRead: true,
        readAt: new Date(),
        deliveryStatus: 'READ',
      },
    });

    res.json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete/archive a thread
exports.archiveThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user.id;

    const participant = await prisma.messageThreadParticipant.findFirst({
      where: {
        threadId,
        userId,
      },
    });

    if (!participant) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    await prisma.messageThreadParticipant.update({
      where: { id: participant.id },
      data: {
        isArchived: true,
      },
    });

    res.json({
      success: true,
      message: 'Thread archived successfully',
    });
  } catch (error) {
    console.error('Error archiving thread:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ success: false, message: 'Only sender can delete this message' });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await prisma.messageThreadParticipant.aggregate({
      where: {
        userId,
        status: 'ACTIVE',
        thread: {
          schoolId: req.school.id,
          status: 'ACTIVE',
        },
      },
      _sum: {
        unreadCount: true,
      },
    });

    res.json({
      success: true,
      unreadCount: unreadCount._sum.unreadCount || 0,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Search users for messaging
exports.searchUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const userId = req.user.id;

    if (!search || search.length < 2) {
      return res.status(400).json({ success: false, message: 'Search query too short' });
    }

    const where = {
      schoolId: req.school.id,
      id: { not: userId },
      isActive: true,
    };

    if (role) where.role = role;

    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
      },
      take: 20,
    });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
