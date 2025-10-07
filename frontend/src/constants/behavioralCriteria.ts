// Predefined behavioral assessment criteria

export const GRADE_SCALE = ['A', 'B', 'C', 'D', 'E'] as const;

export const AFFECTIVE_DOMAIN_CRITERIA = [
  {
    id: 'attentiveness',
    label: 'Attentiveness',
    description: 'Student\'s level of attention and focus in class'
  },
  {
    id: 'class_attendance',
    label: 'Class Attendance',
    description: 'Regular attendance and punctuality'
  },
  {
    id: 'honesty',
    label: 'Honesty',
    description: 'Truthfulness and integrity in academic work'
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'Ability to lead and guide others'
  },
  {
    id: 'neatness',
    label: 'Neatness',
    description: 'Cleanliness and organization of work and appearance'
  },
  {
    id: 'politeness',
    label: 'Politeness',
    description: 'Courtesy and respect towards others'
  },
  {
    id: 'punctuality',
    label: 'Punctuality',
    description: 'Timeliness in arriving and submitting work'
  },
  {
    id: 'application_studies',
    label: 'Application in Studies',
    description: 'Dedication and effort in academic pursuits'
  },
  {
    id: 'attitude_elders',
    label: 'Attitude towards Elders',
    description: 'Respect and behavior towards teachers and elders'
  },
  {
    id: 'attitude_peers',
    label: 'Attitude towards Peers',
    description: 'Respect and cooperation with classmates'
  },
  {
    id: 'attitude_school',
    label: 'Attitude towards School',
    description: 'Pride and care for school property and reputation'
  },
  {
    id: 'conduct_class',
    label: 'Conduct in Class',
    description: 'Behavior and discipline during lessons'
  },
  {
    id: 'discipline',
    label: 'Discipline',
    description: 'Adherence to school rules and regulations'
  },
  {
    id: 'order_neatness',
    label: 'Order & Neatness',
    description: 'Organization and tidiness in work'
  },
  {
    id: 'regularity_punctuality',
    label: 'Regularity & Punctuality',
    description: 'Consistency in attendance and timeliness'
  },
  {
    id: 'proficiency_english',
    label: 'Proficiency in English',
    description: 'Communication skills in English language'
  }
];

export const PSYCHOMOTOR_DOMAIN_CRITERIA = [
  {
    id: 'games',
    label: 'Games',
    description: 'Participation and skill in sports and games'
  },
  {
    id: 'verbal_fluency',
    label: 'Verbal Fluency',
    description: 'Speaking and communication skills'
  },
  {
    id: 'hand_writing',
    label: 'Hand Writing',
    description: 'Legibility and quality of handwriting'
  },
  {
    id: 'musical_skill',
    label: 'Musical Skill',
    description: 'Ability in music and rhythm'
  },
  {
    id: 'handling_tools',
    label: 'Handling Tools',
    description: 'Dexterity and safety in using tools'
  },
  {
    id: 'drawing_painting',
    label: 'Drawing & Painting',
    description: 'Artistic skills and creativity'
  },
  {
    id: 'physical_fitness',
    label: 'Physical Fitness',
    description: 'Overall physical health and coordination'
  },
  {
    id: 'manipulative_skills',
    label: 'Manipulative Skills',
    description: 'Fine motor skills and hand-eye coordination'
  }
];

export const GRADE_DESCRIPTORS = {
  A: { label: 'Excellent', description: 'Outstanding performance', points: 5 },
  B: { label: 'Very Good', description: 'Above average performance', points: 4 },
  C: { label: 'Good', description: 'Satisfactory performance', points: 3 },
  D: { label: 'Fair', description: 'Below average, needs improvement', points: 2 },
  E: { label: 'Poor', description: 'Unsatisfactory, needs significant improvement', points: 1 }
};

export const getDefaultCriteria = (type: 'AFFECTIVE' | 'PSYCHOMOTOR') => {
  return type === 'AFFECTIVE' ? AFFECTIVE_DOMAIN_CRITERIA : PSYCHOMOTOR_DOMAIN_CRITERIA;
};

export const calculateAverageGrade = (grades: string[]): string => {
  if (grades.length === 0) return 'N/A';

  const points = grades.map(grade => GRADE_DESCRIPTORS[grade as keyof typeof GRADE_DESCRIPTORS]?.points || 0);
  const average = points.reduce((a, b) => a + b, 0) / points.length;

  if (average >= 4.5) return 'A';
  if (average >= 3.5) return 'B';
  if (average >= 2.5) return 'C';
  if (average >= 1.5) return 'D';
  return 'E';
};
