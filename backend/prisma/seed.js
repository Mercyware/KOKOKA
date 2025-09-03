const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed the database...');

  // Sample Global Curricula Data
  const globalCurriculaData = [
    {
      name: "Cambridge International Primary Programme",
      description: "A comprehensive primary education curriculum framework designed for learners aged 5-11 years, emphasizing creative thinking, inquiry and problem solving.",
      version: "2023.1",
      type: "CAMBRIDGE",
      provider: "Cambridge Assessment International Education",
      country: "United Kingdom",
      language: "en",
      minGrade: 1,
      maxGrade: 6,
      framework: "Cambridge Primary Framework",
      standards: ["Cambridge Primary Mathematics", "Cambridge Primary English", "Cambridge Primary Science", "Cambridge Primary Global Perspectives"],
      assessmentTypes: ["Formative Assessment", "Summative Assessment", "Cambridge Primary Checkpoint"],
      status: "ACTIVE",
      isOfficial: true,
      licenseType: "INSTITUTIONAL",
      adoptionCount: 245,
      tags: ["primary", "international", "cambridge", "inquiry-based"],
      difficulty: "INTERMEDIATE"
    },
    {
      name: "International Baccalaureate Primary Years Programme",
      description: "The PYP is designed for students aged 3-12. It focuses on the development of the whole child as an inquirer, both in the classroom and in the world outside.",
      version: "2018",
      type: "IB",
      provider: "International Baccalaureate Organization",
      country: "Switzerland",
      language: "en",
      minGrade: 1,
      maxGrade: 6,
      framework: "IB PYP Framework",
      standards: ["Transdisciplinary Themes", "Essential Elements", "Learner Profile"],
      assessmentTypes: ["Formative Assessment", "Summative Assessment", "Student-led Conferences"],
      status: "ACTIVE",
      isOfficial: true,
      licenseType: "INSTITUTIONAL",
      adoptionCount: 189,
      tags: ["primary", "international", "ib", "transdisciplinary"],
      difficulty: "ADVANCED"
    },
    {
      name: "Singapore Mathematics Primary Framework",
      description: "The Singapore Math method is a highly effective teaching approach that instills deep understanding of mathematical concepts through a three-step learning process.",
      version: "2020",
      type: "NATIONAL",
      provider: "Ministry of Education Singapore",
      country: "Singapore",
      language: "en",
      minGrade: 1,
      maxGrade: 6,
      framework: "Singapore Mathematics Framework",
      standards: ["Concrete-Pictorial-Abstract", "Problem Solving Heuristics", "Mathematical Modeling"],
      assessmentTypes: ["Continuous Assessment", "Semestral Assessment", "National Examination"],
      status: "ACTIVE",
      isOfficial: true,
      licenseType: "OPEN",
      adoptionCount: 156,
      tags: ["mathematics", "primary", "singapore", "problem-solving"],
      difficulty: "ADVANCED"
    },
    {
      name: "Montessori Elementary Curriculum",
      description: "The Montessori Elementary curriculum for ages 6-12 builds upon the foundation of independence and love of learning established in the primary years.",
      version: "2022",
      type: "CUSTOM",
      provider: "American Montessori Society",
      country: "United States",
      language: "en",
      minGrade: 1,
      maxGrade: 6,
      framework: "Montessori Method",
      standards: ["Cosmic Education", "Great Lessons", "Mixed-age Learning"],
      assessmentTypes: ["Portfolio Assessment", "Self-Assessment", "Peer Assessment"],
      status: "ACTIVE",
      isOfficial: false,
      licenseType: "OPEN",
      adoptionCount: 78,
      tags: ["montessori", "elementary", "independent-learning", "mixed-age"],
      difficulty: "BEGINNER"
    },
    {
      name: "STEM-Focused Elementary Programme",
      description: "An integrated STEM curriculum designed to develop critical thinking, creativity, and problem-solving skills through hands-on learning experiences.",
      version: "2023",
      type: "STEM",
      provider: "STEM Education Coalition",
      country: "United States",
      language: "en",
      minGrade: 3,
      maxGrade: 8,
      framework: "Integrated STEM Framework",
      standards: ["Next Generation Science Standards", "Common Core Mathematics", "Engineering Design Process"],
      assessmentTypes: ["Project-based Assessment", "Performance Tasks", "Portfolio Assessment"],
      status: "ACTIVE",
      isOfficial: false,
      licenseType: "INSTITUTIONAL",
      adoptionCount: 134,
      tags: ["stem", "project-based", "engineering", "technology"],
      difficulty: "INTERMEDIATE"
    },
    {
      name: "Waldorf Elementary Curriculum",
      description: "The Waldorf elementary curriculum integrates academic, artistic, and practical work to support healthy child development from grades 1-8.",
      version: "2021",
      type: "ARTS",
      provider: "Association of Waldorf Schools of North America",
      country: "United States",
      language: "en",
      minGrade: 1,
      maxGrade: 8,
      framework: "Waldorf Education Methodology",
      standards: ["Age-appropriate Learning", "Artistic Integration", "Practical Life Skills"],
      assessmentTypes: ["Narrative Assessment", "Portfolio Assessment", "Class Teacher Evaluation"],
      status: "ACTIVE",
      isOfficial: false,
      licenseType: "OPEN",
      adoptionCount: 92,
      tags: ["waldorf", "arts-integrated", "holistic", "developmental"],
      difficulty: "INTERMEDIATE"
    },
    {
      name: "UK National Curriculum Key Stage 1 & 2",
      description: "The statutory national curriculum for maintained schools in England, covering Key Stage 1 (ages 5-7) and Key Stage 2 (ages 7-11).",
      version: "2014",
      type: "NATIONAL",
      provider: "Department for Education UK",
      country: "United Kingdom",
      language: "en",
      minGrade: 1,
      maxGrade: 6,
      framework: "UK National Curriculum Framework",
      standards: ["Key Stage 1 Programme of Study", "Key Stage 2 Programme of Study", "Statutory Assessment"],
      assessmentTypes: ["Teacher Assessment", "Statutory Assessment Tests", "Phonics Screening Check"],
      status: "ACTIVE",
      isOfficial: true,
      licenseType: "OPEN",
      adoptionCount: 312,
      tags: ["uk", "national", "key-stage", "statutory"],
      difficulty: "STANDARD"
    },
    {
      name: "Australian Curriculum Foundation to Year 6",
      description: "The Australian Curriculum describes what all young Australians should learn as they progress through schooling from Foundation to Year 12.",
      version: "2022",
      type: "NATIONAL",
      provider: "Australian Curriculum, Assessment and Reporting Authority",
      country: "Australia",
      language: "en",
      minGrade: 0,
      maxGrade: 6,
      framework: "Australian Curriculum Framework",
      standards: ["Learning Areas", "General Capabilities", "Cross-curriculum Priorities"],
      assessmentTypes: ["Formative Assessment", "Summative Assessment", "NAPLAN"],
      status: "ACTIVE",
      isOfficial: true,
      licenseType: "OPEN",
      adoptionCount: 267,
      tags: ["australian", "national", "learning-areas", "capabilities"],
      difficulty: "STANDARD"
    }
  ];

  console.log('📚 Creating Global Curricula...');
  
  // Clear existing data first
  console.log('🧹 Clearing existing curriculum data...');
  await prisma.globalCurriculumSubject.deleteMany();
  await prisma.globalCurriculum.deleteMany();
  
  for (const curriculumData of globalCurriculaData) {
    const curriculum = await prisma.globalCurriculum.create({
      data: curriculumData
    });
    
    // Add subjects for each curriculum
    await createSubjectsForCurriculum(curriculum.id, curriculum.name, curriculum.type);
    console.log(`✅ Created curriculum: ${curriculum.name}`);
  }

  console.log('🌱 Seeding completed successfully!');
}

async function createSubjectsForCurriculum(curriculumId, curriculumName, type) {
  let subjects = [];
  
  if (type === 'CAMBRIDGE') {
    subjects = [
      { name: "English", code: "ENG", description: "Cambridge Primary English", gradeLevel: 1, category: "CORE", recommendedHours: 6, isCore: true },
      { name: "Mathematics", code: "MAT", description: "Cambridge Primary Mathematics", gradeLevel: 1, category: "CORE", recommendedHours: 5, isCore: true },
      { name: "Science", code: "SCI", description: "Cambridge Primary Science", gradeLevel: 1, category: "CORE", recommendedHours: 4, isCore: true },
      { name: "Global Perspectives", code: "GP", description: "Cambridge Primary Global Perspectives", gradeLevel: 1, category: "CORE", recommendedHours: 2, isCore: true },
      { name: "Computing", code: "ICT", description: "Cambridge Primary Computing", gradeLevel: 2, category: "ELECTIVE", recommendedHours: 2, isCore: false },
      { name: "Art & Design", code: "ART", description: "Creative Arts", gradeLevel: 1, category: "ELECTIVE", recommendedHours: 2, isCore: false }
    ];
  } else if (type === 'IB') {
    subjects = [
      { name: "Language Arts", code: "LA", description: "IB PYP Language Arts", gradeLevel: 1, category: "CORE", recommendedHours: 6, isCore: true },
      { name: "Mathematics", code: "MAT", description: "IB PYP Mathematics", gradeLevel: 1, category: "CORE", recommendedHours: 5, isCore: true },
      { name: "Science", code: "SCI", description: "IB PYP Science & Technology", gradeLevel: 1, category: "CORE", recommendedHours: 4, isCore: true },
      { name: "Social Studies", code: "SS", description: "IB PYP Social Studies", gradeLevel: 1, category: "CORE", recommendedHours: 3, isCore: true },
      { name: "Arts", code: "ART", description: "IB PYP Arts", gradeLevel: 1, category: "CORE", recommendedHours: 3, isCore: true },
      { name: "Physical Education", code: "PE", description: "IB PYP Physical, Social & Personal Education", gradeLevel: 1, category: "CORE", recommendedHours: 3, isCore: true }
    ];
  } else if (type === 'STEM') {
    subjects = [
      { name: "Integrated Science", code: "ISCI", description: "Hands-on Science Investigation", gradeLevel: 3, category: "CORE", recommendedHours: 5, isCore: true },
      { name: "Applied Mathematics", code: "AMAT", description: "Real-world Mathematics Applications", gradeLevel: 3, category: "CORE", recommendedHours: 5, isCore: true },
      { name: "Engineering Design", code: "ENG", description: "Engineering Design Process", gradeLevel: 4, category: "CORE", recommendedHours: 4, isCore: true },
      { name: "Technology Integration", code: "TECH", description: "Digital Technology & Programming", gradeLevel: 3, category: "CORE", recommendedHours: 3, isCore: true },
      { name: "Research Methods", code: "RES", description: "Scientific Research & Data Analysis", gradeLevel: 5, category: "ELECTIVE", recommendedHours: 2, isCore: false }
    ];
  } else {
    // Default subject set for other curriculum types
    subjects = [
      { name: "Language Arts", code: "LA", description: "Reading, Writing, Speaking, Listening", gradeLevel: 1, category: "CORE", recommendedHours: 6, isCore: true },
      { name: "Mathematics", code: "MAT", description: "Number, Algebra, Geometry, Statistics", gradeLevel: 1, category: "CORE", recommendedHours: 5, isCore: true },
      { name: "Science", code: "SCI", description: "Physical, Life, and Earth Sciences", gradeLevel: 1, category: "CORE", recommendedHours: 4, isCore: true },
      { name: "Social Studies", code: "SS", description: "History, Geography, Civics", gradeLevel: 1, category: "CORE", recommendedHours: 3, isCore: true },
      { name: "Physical Education", code: "PE", description: "Physical Fitness and Health", gradeLevel: 1, category: "CORE", recommendedHours: 2, isCore: true },
      { name: "Arts", code: "ART", description: "Visual and Performing Arts", gradeLevel: 1, category: "ELECTIVE", recommendedHours: 2, isCore: false }
    ];
  }

  for (const subject of subjects) {
    await prisma.globalCurriculumSubject.create({
      data: {
        ...subject,
        globalCurriculumId: curriculumId
      }
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });