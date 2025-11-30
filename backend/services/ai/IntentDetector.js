/**
 * Intent Detector Service
 * Detects user intent from messages to provide better responses
 */
class IntentDetector {
  constructor() {
    // Define intent patterns
    this.intentPatterns = {
      GREETING: {
        patterns: [
          /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
          /^(greetings|howdy)/i,
        ],
        confidence: 0.9,
      },
      FAREWELL: {
        patterns: [
          /(bye|goodbye|see you|take care|have a good)/i,
          /^(thanks|thank you|thats all)/i,
        ],
        confidence: 0.9,
      },
      ADMISSION: {
        patterns: [
          /(admission|admissions|enroll|enrollment|register|registration|join|joining)/i,
          /(how to apply|application process|apply for)/i,
          /(new student|admission requirements)/i,
        ],
        confidence: 0.85,
      },
      FEES: {
        patterns: [
          /(fee|fees|tuition|payment|pay|cost|price|charges)/i,
          /(how much|what does it cost|fee structure)/i,
          /(school fee|tuition fee)/i,
        ],
        confidence: 0.85,
      },
      ATTENDANCE: {
        patterns: [
          /(attendance|absent|absence|present|leave|holiday)/i,
          /(attendance rate|attendance record|mark attendance)/i,
          /(sick leave|absent from school)/i,
        ],
        confidence: 0.85,
      },
      TIMETABLE: {
        patterns: [
          /(timetable|schedule|class schedule|period|timing)/i,
          /(when is|what time|class timing|school hours)/i,
          /(time table|school schedule)/i,
        ],
        confidence: 0.85,
      },
      EXAMS: {
        patterns: [
          /(exam|examination|test|assessment|quiz)/i,
          /(exam date|exam schedule|test date|exam result)/i,
          /(midterm|final exam|term exam)/i,
        ],
        confidence: 0.85,
      },
      GRADES: {
        patterns: [
          /(grade|grades|result|results|score|marks|performance)/i,
          /(report card|grade report|academic performance)/i,
          /(how is my child doing|student performance)/i,
        ],
        confidence: 0.85,
      },
      TRANSPORTATION: {
        patterns: [
          /(transport|transportation|bus|school bus|route)/i,
          /(bus route|bus timing|bus service|school transport)/i,
          /(pickup|drop off|bus schedule)/i,
        ],
        confidence: 0.85,
      },
      LIBRARY: {
        patterns: [
          /(library|book|books|borrow|issue|return)/i,
          /(library hours|library timings|borrow book)/i,
        ],
        confidence: 0.85,
      },
      HOSTEL: {
        patterns: [
          /(hostel|dormitory|accommodation|boarding|residence)/i,
          /(hostel fee|hostel facility|hostel room)/i,
        ],
        confidence: 0.85,
      },
      STAFF_INQUIRY: {
        patterns: [
          /(teacher|staff|principal|counselor|contact)/i,
          /(meet teacher|talk to|speak with|contact teacher)/i,
          /(teacher contact|staff contact)/i,
        ],
        confidence: 0.8,
      },
      COMPLAINT: {
        patterns: [
          /(complaint|complain|issue|problem|concern|dissatisfied)/i,
          /(not working|not satisfied|unhappy with)/i,
          /(report issue|raise complaint)/i,
        ],
        confidence: 0.8,
      },
      HELP: {
        patterns: [
          /(help|assist|support|guide|how do i|how can i)/i,
          /(what can you do|how does this work)/i,
          /(need help|can you help)/i,
        ],
        confidence: 0.85,
      },
      UNKNOWN: {
        patterns: [],
        confidence: 0.5,
      },
    };
  }

  /**
   * Detect intent from user message
   * @param {String} message - User message
   * @returns {Object} - Detected intent with confidence
   */
  detect(message) {
    if (!message || typeof message !== 'string') {
      return { intent: 'UNKNOWN', confidence: 0 };
    }

    const normalizedMessage = message.trim().toLowerCase();
    let detectedIntent = 'UNKNOWN';
    let maxConfidence = 0;

    // Check each intent pattern
    for (const [intent, config] of Object.entries(this.intentPatterns)) {
      if (intent === 'UNKNOWN') continue;

      for (const pattern of config.patterns) {
        if (pattern.test(normalizedMessage)) {
          if (config.confidence > maxConfidence) {
            detectedIntent = intent;
            maxConfidence = config.confidence;
          }
        }
      }
    }

    // If no intent detected, mark as UNKNOWN
    if (maxConfidence === 0) {
      detectedIntent = 'UNKNOWN';
      maxConfidence = 0.5;
    }

    return {
      intent: detectedIntent,
      confidence: maxConfidence,
      category: this.getCategory(detectedIntent),
    };
  }

  /**
   * Get category for intent
   */
  getCategory(intent) {
    const categoryMap = {
      GREETING: 'GENERAL',
      FAREWELL: 'GENERAL',
      HELP: 'GENERAL',
      ADMISSION: 'ADMISSIONS',
      FEES: 'FEES',
      ATTENDANCE: 'ATTENDANCE',
      TIMETABLE: 'TIMETABLE',
      EXAMS: 'EXAMS',
      GRADES: 'ACADEMICS',
      TRANSPORTATION: 'TRANSPORTATION',
      LIBRARY: 'LIBRARY',
      HOSTEL: 'HOSTEL',
      STAFF_INQUIRY: 'GENERAL',
      COMPLAINT: 'GENERAL',
      UNKNOWN: 'GENERAL',
    };

    return categoryMap[intent] || 'GENERAL';
  }

  /**
   * Get suggested actions based on intent
   */
  getSuggestedActions(intent) {
    const actionMap = {
      GREETING: [
        { action: 'show_menu', label: 'What can I help you with?' },
        { action: 'show_quick_questions', label: 'Common questions' },
      ],
      ADMISSION: [
        { action: 'show_admission_form', label: 'Start admission process' },
        { action: 'show_admission_requirements', label: 'View requirements' },
      ],
      FEES: [
        { action: 'show_fee_structure', label: 'View fee structure' },
        { action: 'pay_fees', label: 'Make payment' },
      ],
      ATTENDANCE: [
        { action: 'view_attendance', label: 'View attendance record' },
        { action: 'request_leave', label: 'Request leave' },
      ],
      TIMETABLE: [
        { action: 'view_timetable', label: 'View timetable' },
        { action: 'download_timetable', label: 'Download timetable' },
      ],
      EXAMS: [
        { action: 'view_exam_schedule', label: 'View exam schedule' },
        { action: 'view_exam_results', label: 'View results' },
      ],
      GRADES: [
        { action: 'view_report_card', label: 'View report card' },
        { action: 'view_performance', label: 'View performance' },
      ],
      TRANSPORTATION: [
        { action: 'view_bus_route', label: 'View bus routes' },
        { action: 'track_bus', label: 'Track bus' },
      ],
      COMPLAINT: [
        { action: 'file_complaint', label: 'File complaint' },
        { action: 'contact_support', label: 'Contact support' },
      ],
      HELP: [
        { action: 'show_help', label: 'Help center' },
        { action: 'contact_support', label: 'Contact support' },
      ],
    };

    return actionMap[intent] || [];
  }

  /**
   * Extract entities from message
   * Simple entity extraction - can be enhanced with NLP libraries
   */
  extractEntities(message) {
    const entities = {
      dates: [],
      times: [],
      names: [],
      numbers: [],
    };

    // Extract dates (simple patterns)
    const datePattern = /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/g;
    entities.dates = [...(message.match(datePattern) || [])];

    // Extract times
    const timePattern = /\b(\d{1,2}:\d{2}\s*(am|pm)?)\b/gi;
    entities.times = [...(message.match(timePattern) || [])];

    // Extract numbers
    const numberPattern = /\b(\d+)\b/g;
    entities.numbers = [...(message.match(numberPattern) || [])];

    return entities;
  }
}

module.exports = new IntentDetector();
