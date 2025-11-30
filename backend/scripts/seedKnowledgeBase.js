const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Sample Knowledge Base Entries
 * Global FAQs for all schools
 */
const knowledgeBaseEntries = [
  // ADMISSIONS
  {
    category: 'ADMISSIONS',
    question: 'What is the admission process?',
    answer:
      'The admission process involves: 1) Submit online application form, 2) Submit required documents, 3) Take admission test (if applicable), 4) Attend interview, 5) Await admission decision, 6) Complete registration and pay fees.',
    keywords: ['admission', 'process', 'apply', 'enroll', 'registration'],
    relatedQuestions: [
      'What documents are required for admission?',
      'When do admissions open?',
    ],
    priority: 10,
  },
  {
    category: 'ADMISSIONS',
    question: 'What documents are required for admission?',
    answer:
      'Required documents: Birth certificate, Previous school transcripts, Passport-size photographs, Address proof, Medical records/immunization certificate, Transfer certificate (if applicable), Parent/guardian ID proof.',
    keywords: ['documents', 'required', 'admission', 'certificate', 'proof'],
    relatedQuestions: ['What is the admission process?'],
    priority: 9,
  },
  {
    category: 'ADMISSIONS',
    question: 'When do admissions open?',
    answer:
      'Admissions typically open in January for the new academic year starting in June. However, specific dates may vary. Please check the school website or contact the admissions office for exact dates.',
    keywords: ['admission', 'dates', 'when', 'open', 'academic year'],
    relatedQuestions: ['What is the admission process?'],
    priority: 8,
  },

  // FEES
  {
    category: 'FEES',
    question: 'What is the fee structure?',
    answer:
      'Fee structure varies by grade level and includes: Tuition fees, Development fees, Activity fees, Library fees, Transportation fees (optional), Hostel fees (optional). Please contact the accounts department for detailed fee breakdown.',
    keywords: ['fee', 'fees', 'structure', 'cost', 'tuition', 'payment'],
    relatedQuestions: ['How can I pay school fees?', 'Are there any scholarships available?'],
    priority: 10,
  },
  {
    category: 'FEES',
    question: 'How can I pay school fees?',
    answer:
      'School fees can be paid through: Online payment portal (credit/debit card, net banking), Bank transfer, Check payment at school office, Cash payment at accounts office. Payment schedule is typically termly or annually.',
    keywords: ['pay', 'payment', 'fees', 'online', 'bank'],
    relatedQuestions: ['What is the fee structure?'],
    priority: 9,
  },
  {
    category: 'FEES',
    question: 'Are there any scholarships available?',
    answer:
      'Yes, the school offers merit-based and need-based scholarships. Scholarship applications are typically reviewed at the beginning of each academic year. Contact the admissions office for more information and application procedures.',
    keywords: ['scholarship', 'financial aid', 'merit', 'support'],
    relatedQuestions: ['What is the fee structure?'],
    priority: 7,
  },

  // ATTENDANCE
  {
    category: 'ATTENDANCE',
    question: 'What is the attendance policy?',
    answer:
      'Students must maintain at least 85% attendance to be eligible for examinations. Absences must be reported to the class teacher. Medical certificates are required for extended absences. Unexplained absences may result in disciplinary action.',
    keywords: ['attendance', 'absent', 'policy', 'present', 'leave'],
    relatedQuestions: ['How do I apply for leave?'],
    priority: 9,
  },
  {
    category: 'ATTENDANCE',
    question: 'How do I apply for leave?',
    answer:
      'To apply for leave: 1) Submit leave application to class teacher at least one day in advance, 2) For extended leave (>3 days), get approval from principal, 3) Medical certificate required for sick leave >2 days, 4) Leave applications can be submitted through the parent portal.',
    keywords: ['leave', 'absent', 'application', 'sick', 'holiday'],
    relatedQuestions: ['What is the attendance policy?'],
    priority: 8,
  },

  // TIMETABLE
  {
    category: 'TIMETABLE',
    question: 'What are the school hours?',
    answer:
      'School hours: Monday to Friday: 8:00 AM - 3:00 PM. Saturday: 8:00 AM - 12:00 PM (if applicable). Assembly: 8:00 AM - 8:15 AM. Lunch break: 12:00 PM - 12:45 PM. Specific class timings may vary by grade.',
    keywords: ['hours', 'timing', 'schedule', 'timetable', 'school hours'],
    relatedQuestions: ['Where can I get the class timetable?'],
    priority: 10,
  },
  {
    category: 'TIMETABLE',
    question: 'Where can I get the class timetable?',
    answer:
      'Class timetables are available: On the student portal, From the class teacher, Posted on class notice board, Shared via parent portal. Timetables are typically distributed at the beginning of each term.',
    keywords: ['timetable', 'schedule', 'class', 'periods'],
    relatedQuestions: ['What are the school hours?'],
    priority: 8,
  },

  // EXAMS
  {
    category: 'EXAMS',
    question: 'When are the exams?',
    answer:
      'The academic year has three terms with assessments: First Term: September-October, Second Term: January-February, Final Exams: May-June. Exact dates are announced at the beginning of each term. Check the academic calendar for details.',
    keywords: ['exam', 'test', 'assessment', 'dates', 'schedule'],
    relatedQuestions: ['How can I check exam results?'],
    priority: 10,
  },
  {
    category: 'EXAMS',
    question: 'How can I check exam results?',
    answer:
      'Exam results are available through: Student portal (online), Parent portal, Report cards (distributed by class teacher), SMS notification to registered mobile number. Results are typically published within 2 weeks of exams.',
    keywords: ['results', 'grades', 'scores', 'marks', 'report card'],
    relatedQuestions: ['When are the exams?'],
    priority: 9,
  },

  // TRANSPORTATION
  {
    category: 'TRANSPORTATION',
    question: 'Does the school provide transportation?',
    answer:
      'Yes, the school provides bus transportation covering major areas of the city. Transportation is optional and requires separate payment. Routes and timings are fixed. Real-time bus tracking is available through the parent app.',
    keywords: ['transport', 'bus', 'transportation', 'school bus'],
    relatedQuestions: ['How do I apply for school bus?', 'What are the bus routes?'],
    priority: 9,
  },
  {
    category: 'TRANSPORTATION',
    question: 'How do I apply for school bus?',
    answer:
      'To apply for school bus: 1) Fill transport application form, 2) Choose pickup/drop point, 3) Pay transportation fees, 4) Receive bus pass and route details. Applications are accepted at the beginning of each term.',
    keywords: ['bus', 'transport', 'apply', 'application'],
    relatedQuestions: ['Does the school provide transportation?'],
    priority: 8,
  },

  // LIBRARY
  {
    category: 'LIBRARY',
    question: 'What are the library hours?',
    answer:
      'Library hours: Monday to Friday: 8:00 AM - 4:00 PM, Saturday: 8:00 AM - 1:00 PM. Students can borrow up to 3 books for 2 weeks. Late returns incur fines. Library cards are issued to all students.',
    keywords: ['library', 'hours', 'timing', 'books'],
    relatedQuestions: ['How many books can I borrow?'],
    priority: 7,
  },
  {
    category: 'LIBRARY',
    question: 'How many books can I borrow?',
    answer:
      'Students can borrow up to 3 books at a time for a period of 2 weeks. Books can be renewed once if no one else has requested them. Reference books and journals are for library use only. Digital resources are available through the online portal.',
    keywords: ['books', 'borrow', 'issue', 'library'],
    relatedQuestions: ['What are the library hours?'],
    priority: 7,
  },

  // HOSTEL
  {
    category: 'HOSTEL',
    question: 'Does the school have hostel facilities?',
    answer:
      'Yes, the school provides separate hostel facilities for boys and girls. Facilities include: Furnished rooms, 24/7 security, Nutritious meals, Study hall, Recreation room, Medical care. Hostel admission requires separate application.',
    keywords: ['hostel', 'boarding', 'accommodation', 'dormitory'],
    relatedQuestions: ['What are the hostel fees?'],
    priority: 6,
  },
  {
    category: 'HOSTEL',
    question: 'What are the hostel fees?',
    answer:
      'Hostel fees include accommodation, meals, and basic amenities. Fees vary by room type (shared/private). Payment is typically annual or termly. Contact the hostel warden for detailed fee structure and payment schedule.',
    keywords: ['hostel', 'fees', 'boarding', 'cost'],
    relatedQuestions: ['Does the school have hostel facilities?'],
    priority: 6,
  },

  // GENERAL
  {
    category: 'GENERAL',
    question: 'How can I contact the school?',
    answer:
      'You can contact the school through: Phone: Main office number, Email: info@school.com, Website: www.school.com, In-person: Visit the school office during working hours (8 AM - 4 PM), Parent portal: Send messages to teachers/administration.',
    keywords: ['contact', 'phone', 'email', 'address', 'reach'],
    relatedQuestions: [],
    priority: 8,
  },
  {
    category: 'GENERAL',
    question: 'What extracurricular activities are available?',
    answer:
      'The school offers various extracurricular activities: Sports: Cricket, Football, Basketball, Tennis, Athletics, Arts: Music, Dance, Drama, Painting, Clubs: Science Club, Debate Club, Robotics, Environmental Club, Students can choose activities based on interest.',
    keywords: ['activities', 'sports', 'clubs', 'extracurricular'],
    relatedQuestions: [],
    priority: 7,
  },

  // ACADEMICS
  {
    category: 'ACADEMICS',
    question: 'What is the curriculum followed?',
    answer:
      'The school follows [CURRICULUM_NAME] curriculum. We offer comprehensive programs from primary to senior secondary levels. The curriculum focuses on holistic development including academics, sports, arts, and character building.',
    keywords: ['curriculum', 'syllabus', 'academic', 'program'],
    relatedQuestions: [],
    priority: 8,
  },
  {
    category: 'ACADEMICS',
    question: 'Are there remedial classes?',
    answer:
      'Yes, remedial classes are conducted for students who need extra help. These classes are held after school hours. Teachers identify students who need support and notify parents. Remedial classes are free of charge.',
    keywords: ['remedial', 'extra classes', 'help', 'support', 'tutoring'],
    relatedQuestions: [],
    priority: 6,
  },
];

async function seedKnowledgeBase() {
  try {
    console.log('🌱 Seeding Knowledge Base...');

    // Delete existing entries (optional - comment out to preserve existing data)
    // await prisma.knowledgeBase.deleteMany({});

    // Create entries
    const result = await prisma.knowledgeBase.createMany({
      data: knowledgeBaseEntries,
      skipDuplicates: true,
    });

    console.log(`✅ Created ${result.count} knowledge base entries`);

    // Get category counts
    const categoryCounts = await prisma.knowledgeBase.groupBy({
      by: ['category'],
      _count: true,
    });

    console.log('\n📊 Entries by category:');
    categoryCounts.forEach((cat) => {
      console.log(`  ${cat.category}: ${cat._count}`);
    });

    console.log('\n✨ Knowledge base seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding knowledge base:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedKnowledgeBase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedKnowledgeBase, knowledgeBaseEntries };
