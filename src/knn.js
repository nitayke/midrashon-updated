/**
 * Advanced Weighted Hybrid Cosine-Euclidean KNN Matching Engine for Midrashon (מדרשון)
 * Includes Uniform Answer Easter Egg Edge Cases from Midrashon
 */

export const PARAM_DEFINITIONS = [
  { 
    id: 'halacha', 
    label: 'לימוד הלכה', 
    question: 'איזה דגש את מחפשת על לימוד הלכה?', 
    minLabel: 'בסיסי', 
    maxLabel: 'לימוד מעמיק ואינטנסיבי',
    type: 'preference'
  },
  { 
    id: 'gemara', 
    label: 'לימוד גמרא', 
    question: 'איזה דגש את מחפשת על לימוד גמרא ועיון?', 
    minLabel: 'דגש נמוך / משולב', 
    maxLabel: 'דגש מרכזי ואינטנסיבי',
    type: 'preference'
  },
  { 
    id: 'rav_kook', 
    label: 'לימוד הרב קוק', 
    question: 'כמה דגש את מחפשת על לימוד תורת הרב קוק?', 
    minLabel: 'ללא דגש מיוחד', 
    maxLabel: 'לימוד מעמיק בתורת הרב קוק',
    type: 'preference'
  },
  { 
    id: 'female_figures', 
    label: 'דמויות הלכתיות נשיות', 
    question: 'כמה חשוב לך שיהיו דמויות הלכתיות נשיות ורמיות במדרשה?', 
    minLabel: 'לא משנה לי', 
    maxLabel: 'חשוב מאוד (נוכחות נשית תורנית מובילה)',
    type: 'preference'
  },
  { 
    id: 'chassidut', 
    label: 'לימוד חסידות', 
    question: 'כמה דגש את מחפשת על חסידות (לימוד, אווירה ורגש)?', 
    minLabel: 'ללא דגש חסידי', 
    maxLabel: 'דגש חסידי חזק והתוועדויות',
    type: 'preference'
  },
  { 
    id: 'social', 
    label: 'חברתיות וגיבוש', 
    question: 'כמה חשוב לך החברתיות, האווירה והגיבוש במדרשה?', 
    minLabel: 'לא חשוב בכלל', 
    maxLabel: 'חשוב מאוד (חברתיות וגיבוש חזק)',
    type: 'preference'
  },
  { 
    id: 'personal_relation', 
    label: 'יחס אישי וליווי', 
    question: 'כמה חשוב לך יחס אישי וקשר קרוב עם הצוות והרמיות?', 
    minLabel: 'לא חשוב בכלל', 
    maxLabel: 'חשוב מאוד (קשר אישי וליווי צמוד)',
    type: 'preference'
  },
  { 
    id: 'liberalism', 
    label: 'ליברליות ופתיחות', 
    question: 'לאיזה סגנון רוחני ופתיחות מחשבתית את מתחברת?', 
    minLabel: 'שמרנית ומסורתית', 
    maxLabel: 'ליברלית ופתוחה',
    type: 'preference'
  },
  { 
    id: 'halacha_commitment', 
    label: 'הלכה כמחויבות', 
    question: 'מה התפיסה הרוחנית לגבי הלכה כמחויבות והקפדה במדרשה?', 
    minLabel: 'גמישה / אישית', 
    maxLabel: 'מחויבות הלכתית הדוקה',
    type: 'preference'
  },
  { 
    id: 'conditions', 
    label: 'תנאים פיזיים', 
    question: 'כמה חשוב לך התנאים הפיזיים (אוכל, פנימיות וכדומה)?', 
    minLabel: 'לא חשוב בכלל', 
    maxLabel: 'חשוב מאוד (תנאים מעולים)',
    type: 'preference'
  },
  { 
    id: 'emunah', 
    label: 'לימוד אמונה', 
    question: 'כמה דגש את מחפשת על לימוד אמונה ומחשבת ישראל?', 
    minLabel: 'בסיסי', 
    maxLabel: 'עיסוק מורחב ומעמיק באמונה',
    type: 'preference'
  },
  { 
    id: 'tanach', 
    label: 'לימוד תנ"ך', 
    question: 'כמה דגש את מחפשת על לימוד תנ"ך?', 
    minLabel: 'בסיסי', 
    maxLabel: 'לימוד תנ"ך מורחב ומעמיק',
    type: 'preference'
  },
  { 
    id: 'non_torah_activities', 
    label: 'פעילויות לא תורניות', 
    question: 'כמה את רוצה שיהיו פעילויות לא תורניות (התנדבויות, סדנאות וכדומה)?', 
    minLabel: 'דגש תורני בלבד', 
    maxLabel: 'סדנאות, התנדבויות והעשרה',
    type: 'preference'
  }
];

export const REGION_TRANSLATIONS = {
  all: 'כל הארץ',
  north: 'צפון',
  center: 'מרכז',
  jerusalem: 'ירושלים',
  south: 'דרום'
};

export const REGIONS = [
  { id: 'all', label: 'כל הארץ' },
  { id: 'north', label: 'צפון (גליל / גולן / עכו / צפת)' },
  { id: 'center', label: 'מרכז (גוש דן / שפלה / שומרון)' },
  { id: 'jerusalem', label: 'ירושלים וסביבתה' },
  { id: 'south', label: 'דרום (נגב / שדרות / אילת)' }
];

export const TYPES = [
  { id: 'all', label: 'כל המסלולים' },
  { id: 'before_service', label: 'לפני שירות לאומי/צבא' },
  { id: 'after_service', label: 'אחרי שירות/צבא' },
  { id: 'before_army', label: 'לפני צבא' },
  { id: 'service_combo', label: 'שילוב שירות' },
  { id: 'academic_combo', label: 'שילוב אקדמיה' }
];

export const TYPE_TRANSLATIONS = {
  all: 'כל המסלולים',
  before_service: 'לפני שירות לאומי/צבא',
  after_service: 'אחרי שירות/צבא',
  before_army: 'לפני צבא',
  service_combo: 'שילוב שירות',
  academic_combo: 'שילוב אקדמיה'
};

/**
 * Advanced Weighted Hybrid Cosine-Euclidean KNN Matching Algorithm for Midrashon
 */
export const calculateKNNMatches = (userPreferences, yeshivotList, k = 3) => {
  const { region, type, ratings, ignoreParams = {} } = userPreferences;

  // Midrashon Easter Egg check: Trigger ONLY if ALL 13 parameters are rated (none ignored) AND all 13 ratings are 100% identical!
  const hasIgnoredParams = PARAM_DEFINITIONS.some(p => ignoreParams[p.id]);
  const allRatings = PARAM_DEFINITIONS.map(p => Number(ratings[p.id]) || 3);
  const allIdentical = allRatings.every(val => val === allRatings[0]);

  if (!hasIgnoredParams && allIdentical) {
    const val = allRatings[0];
    if (val === 1) {
      return [{
        id: 'wedding',
        name: 'תתחתני, אחותי',
        type: 'all',
        region: 'all',
        matchScore: 100,
        isEasterEgg: true
      }];
    }

    if ([2, 3, 4].includes(val)) {
      return [{
        id: 'berlin',
        name: 'האוניברסיטה החופשית של ברלין',
        type: 'all',
        region: 'all',
        matchScore: 100,
        isEasterEgg: true
      }];
    }

    if (val === 5) {
      return [{
        id: 'hit',
        name: 'המכון הטכנולוגי חולון',
        type: 'all',
        region: 'all',
        matchScore: 100,
        isEasterEgg: true
      }];
    }
  }

  // Weight map for Midrashon 13 parameters
  const paramWeights = {
    halacha: 1.2,
    gemara: 1.4,
    rav_kook: 1.3,
    female_figures: 1.2,
    chassidut: 1.2,
    social: 1.1,
    personal_relation: 1.1,
    liberalism: 1.6,
    halacha_commitment: 1.4,
    conditions: 1.0,
    emunah: 1.2,
    tanach: 1.1,
    non_torah_activities: 1.2
  };

  const scoredMidrashot = yeshivotList.map(midrasha => {
    // HYBRID COSINE-EUCLIDEAN SIMILARITY ENGINE
    let dotProduct = 0;
    let normU = 0;
    let normV = 0;
    let weightedDistSq = 0;
    let totalWeight = 0;

    PARAM_DEFINITIONS.forEach(param => {
      if (ignoreParams[param.id]) return;

      const userVal = Number(ratings[param.id]) || 3;
      const midrashaVal = Number(midrasha.ratings ? midrasha.ratings[param.id] : 3) || 3;
      const weight = paramWeights[param.id] || 1.0;

      // Cosine Similarity components
      dotProduct += weight * userVal * midrashaVal;
      normU += weight * userVal * userVal;
      normV += weight * midrashaVal * midrashaVal;

      // Normalized Euclidean Distance components
      const normDiff = (userVal - midrashaVal) / 4.0;
      weightedDistSq += weight * (normDiff * normDiff);
      totalWeight += weight;
    });

    const cosineSim = (normU > 0 && normV > 0) ? (dotProduct / (Math.sqrt(normU) * Math.sqrt(normV))) : 1.0;
    const rmsDistance = totalWeight > 0 ? Math.sqrt(weightedDistSq / totalWeight) : 0;

    // Strict Track compatibility check matching original Midrashon logic
    let typePenalty = 0;
    if (type && type !== 'all') {
      if (midrasha.tracks && midrasha.tracks[type] === true) {
        typePenalty = 0;
      } else if (midrasha.tracks && midrasha.tracks[type] === false) {
        typePenalty = 0.60;
      } else if (midrasha.type !== type) {
        typePenalty = 0.25;
      }
    }

    // Penalty for Region mismatch
    const regionPenalty = (region && region !== 'all' && midrasha.region !== region) ? 0.25 : 0;
    const totalPenalty = typePenalty + regionPenalty;

    // Hybrid Distance metric: 85% Euclidean accuracy + 15% Cosine angular alignment
    let rawDistance = (0.85 * rmsDistance) + (0.15 * (1 - Math.min(1.0, cosineSim))) + totalPenalty;
    const hybridDistance = Math.abs(rawDistance) < 1e-6 ? 0 : rawDistance;

    let matchScore;
    if (hybridDistance === 0) {
      matchScore = 100;
    } else {
      let matchFactor = Math.exp(-1.8 * hybridDistance);
      matchScore = Math.round(matchFactor * 100);
      matchScore = Math.max(18, Math.min(99, matchScore));
    }

    return {
      id: midrasha.id,
      name: midrasha.name,
      type: midrasha.type,
      region: midrasha.region,
      matchScore,
      distance: hybridDistance
    };
  });

  // Sort descending by match score
  scoredMidrashot.sort((a, b) => b.matchScore - a.matchScore);

  return scoredMidrashot.slice(0, k);
};
