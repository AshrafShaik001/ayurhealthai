// 20-question Dosha assessment
// Each option carries a dosha weight (vata | pitta | kapha)
// Options are intentionally displayed in varied order so no dosha is always "first"

export const QUESTIONS = [
  // ── PHYSICAL (Q 1–8) ────────────────────────────────────────
  {
    id: 1,
    category: 'Physical',
    question: 'How would you describe your natural body frame?',
    options: [
      { id: 'a', text: 'Thin and light — I find it hard to gain weight', dosha: 'vata' },
      { id: 'b', text: 'Medium and muscular — I gain or lose weight fairly easily', dosha: 'pitta' },
      { id: 'c', text: 'Large and solid — I tend to gain weight and keep it', dosha: 'kapha' },
    ],
  },
  {
    id: 2,
    category: 'Physical',
    question: 'What is your skin like most of the time?',
    options: [
      { id: 'a', text: 'Dry, rough, or flaky — especially in cold weather', dosha: 'vata' },
      { id: 'b', text: 'Oily, warm, sensitive, or prone to redness and breakouts', dosha: 'pitta' },
      { id: 'c', text: 'Smooth, moist, cool, and soft to the touch', dosha: 'kapha' },
    ],
  },
  {
    id: 3,
    category: 'Physical',
    question: 'How would you describe your hair naturally?',
    options: [
      { id: 'a', text: 'Dry, frizzy, brittle, or thin', dosha: 'vata' },
      { id: 'b', text: 'Fine, straight, oily, or prone to early thinning or greying', dosha: 'pitta' },
      { id: 'c', text: 'Thick, lustrous, wavy, and full', dosha: 'kapha' },
    ],
  },
  {
    id: 4,
    category: 'Physical',
    question: 'How is your appetite generally?',
    options: [
      { id: 'a', text: 'Irregular — sometimes ravenous, sometimes I forget to eat', dosha: 'vata' },
      { id: 'b', text: 'Strong and intense — I get irritable or shaky if I miss a meal', dosha: 'pitta' },
      { id: 'c', text: 'Steady but low — I can comfortably skip a meal without noticing', dosha: 'kapha' },
    ],
  },
  {
    id: 5,
    category: 'Physical',
    question: 'How do you typically sleep?',
    options: [
      { id: 'a', text: 'Light and restless — I wake easily and have vivid or anxious dreams', dosha: 'vata' },
      { id: 'b', text: 'Moderate — I fall asleep okay but may wake up with a hot or alert mind', dosha: 'pitta' },
      { id: 'c', text: 'Deep and heavy — I love to sleep long and feel groggy waking up', dosha: 'kapha' },
    ],
  },
  {
    id: 6,
    category: 'Physical',
    question: 'How does your energy level typically behave throughout the day?',
    options: [
      { id: 'a', text: 'Comes in bursts — high energy spurts followed by sudden fatigue', dosha: 'vata' },
      { id: 'b', text: 'Consistently strong and driven — I push through the day purposefully', dosha: 'pitta' },
      { id: 'c', text: 'Slow to start in the morning but builds steadily and lasts', dosha: 'kapha' },
    ],
  },
  {
    id: 7,
    category: 'Physical',
    question: 'How do you respond to changes in temperature?',
    options: [
      { id: 'a', text: 'I feel cold easily and dislike wind — I always want to be warm', dosha: 'vata' },
      { id: 'b', text: 'I overheat easily and strongly prefer cool, shaded environments', dosha: 'pitta' },
      { id: 'c', text: 'I dislike cold and damp weather — I prefer warmth but not direct heat', dosha: 'kapha' },
    ],
  },
  {
    id: 8,
    category: 'Physical',
    question: 'How is your digestion?',
    options: [
      { id: 'a', text: 'Unpredictable — alternates between constipation, gas, and bloating', dosha: 'vata' },
      { id: 'b', text: 'Strong but sharp — prone to acidity, heartburn, or loose stools under stress', dosha: 'pitta' },
      { id: 'c', text: 'Slow and steady — food takes a long time to digest but rarely causes upset', dosha: 'kapha' },
    ],
  },

  // ── MENTAL (Q 9–14) ─────────────────────────────────────────
  {
    id: 9,
    category: 'Mental',
    question: 'How do you absorb new information?',
    options: [
      { id: 'a', text: 'I grasp ideas quickly but often forget details without review', dosha: 'vata' },
      { id: 'b', text: 'I learn at a moderate pace and retain well through analysis', dosha: 'pitta' },
      { id: 'c', text: 'I learn slowly and methodically but once it sticks, I never forget it', dosha: 'kapha' },
    ],
  },
  {
    id: 10,
    category: 'Mental',
    question: 'How would you best describe the quality of your mind?',
    options: [
      { id: 'a', text: 'Active and imaginative — ideas flow fast but concentration wanders', dosha: 'vata' },
      { id: 'b', text: 'Sharp, focused, and analytical — I like to dig deep and solve things', dosha: 'pitta' },
      { id: 'c', text: 'Calm and methodical — I think things through slowly and deliberately', dosha: 'kapha' },
    ],
  },
  {
    id: 11,
    category: 'Mental',
    question: 'How do you typically make decisions?',
    options: [
      { id: 'a', text: 'Quickly and intuitively — but I often second-guess or change my mind', dosha: 'vata' },
      { id: 'b', text: 'Decisively — I weigh the facts and commit confidently', dosha: 'pitta' },
      { id: 'c', text: 'Slowly and carefully — once I decide, I rarely change course', dosha: 'kapha' },
    ],
  },
  {
    id: 12,
    category: 'Mental',
    question: 'When you are stressed or under pressure, how do you react?',
    options: [
      { id: 'a', text: 'I become anxious, worried, scattered, or overwhelmed', dosha: 'vata' },
      { id: 'b', text: 'I become irritable, critical, impatient, or angry', dosha: 'pitta' },
      { id: 'c', text: 'I withdraw quietly, feel heavy, or become even more slow and reluctant', dosha: 'kapha' },
    ],
  },
  {
    id: 13,
    category: 'Mental',
    question: 'How would others describe the way you speak?',
    options: [
      { id: 'a', text: 'Fast, enthusiastic, and expressive — sometimes jumping between topics', dosha: 'vata' },
      { id: 'b', text: 'Clear, articulate, and persuasive — I choose my words precisely', dosha: 'pitta' },
      { id: 'c', text: 'Slow, steady, and soothing — I think before I speak', dosha: 'kapha' },
    ],
  },
  {
    id: 14,
    category: 'Mental',
    question: 'What is your default emotional experience?',
    options: [
      { id: 'a', text: 'Enthusiastic and changeable — my mood shifts throughout the day', dosha: 'vata' },
      { id: 'b', text: 'Passionate and driven — I feel emotions intensely and purposefully', dosha: 'pitta' },
      { id: 'c', text: 'Steady and warm — I rarely get ruffled and am naturally content', dosha: 'kapha' },
    ],
  },

  // ── LIFESTYLE (Q 15–20) ──────────────────────────────────────
  {
    id: 15,
    category: 'Lifestyle',
    question: 'What type of physical activity do you naturally gravitate toward?',
    options: [
      { id: 'a', text: 'Light, varied activities — yoga, walking, dance, or stretching', dosha: 'vata' },
      { id: 'b', text: 'Competitive or intense workouts — running, sports, or HIIT training', dosha: 'pitta' },
      { id: 'c', text: 'Steady endurance activities — hiking, swimming, or cycling', dosha: 'kapha' },
    ],
  },
  {
    id: 16,
    category: 'Lifestyle',
    question: 'How do you approach work and projects?',
    options: [
      { id: 'a', text: 'I love starting new things with enthusiasm but find it hard to finish', dosha: 'vata' },
      { id: 'b', text: 'I am highly goal-driven, efficient, and sometimes perfectionistic', dosha: 'pitta' },
      { id: 'c', text: 'I am steady and reliable but need external push to get started', dosha: 'kapha' },
    ],
  },
  {
    id: 17,
    category: 'Lifestyle',
    question: 'How do you naturally behave in social settings?',
    options: [
      { id: 'a', text: 'Lively and talkative — I love meeting new people and thrive on variety', dosha: 'vata' },
      { id: 'b', text: 'Confident and engaging — I enjoy stimulating intellectual conversations', dosha: 'pitta' },
      { id: 'c', text: 'Warm and loyal — I prefer intimate gatherings with close friends', dosha: 'kapha' },
    ],
  },
  {
    id: 18,
    category: 'Lifestyle',
    question: 'How do you feel about daily routines and structure?',
    options: [
      { id: 'a', text: 'I resist rigid routines — I crave variety, spontaneity, and change', dosha: 'vata' },
      { id: 'b', text: 'I appreciate structured routines that keep me on track toward goals', dosha: 'pitta' },
      { id: 'c', text: 'I thrive with consistent habits — disruption to my routine unsettles me', dosha: 'kapha' },
    ],
  },
  {
    id: 19,
    category: 'Lifestyle',
    question: 'What best describes your relationship with food?',
    options: [
      { id: 'a', text: 'I love trying new cuisines and tend to snack irregularly throughout the day', dosha: 'vata' },
      { id: 'b', text: 'I enjoy bold, spiced flavours and eat at regular set times', dosha: 'pitta' },
      { id: 'c', text: 'I love hearty, creamy comfort foods and eat slowly and steadily', dosha: 'kapha' },
    ],
  },
  {
    id: 20,
    category: 'Lifestyle',
    question: 'How do you most love to spend free time?',
    options: [
      { id: 'a', text: 'Creating, imagining, or exploring spontaneous new activities and ideas', dosha: 'vata' },
      { id: 'b', text: 'Planning, reading, debating, or channelling energy into meaningful goals', dosha: 'pitta' },
      { id: 'c', text: 'Relaxing, cooking, gardening, or spending quiet time in nature', dosha: 'kapha' },
    ],
  },
]

export const DOSHA_META = {
  vata: {
    name: 'Vata',
    emoji: '💨',
    elements: 'Air & Space',
    tagline: 'The Creative Force',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    border: 'border-violet-300',
    badge: 'bg-violet-100 text-violet-700',
    bar: 'bg-gradient-to-r from-violet-400 to-purple-500',
    ring: 'ring-violet-300',
    traits: ['Creative', 'Energetic', 'Enthusiastic', 'Quick-minded', 'Adaptable'],
  },
  pitta: {
    name: 'Pitta',
    emoji: '🔥',
    elements: 'Fire & Water',
    tagline: 'The Transformative Force',
    gradient: 'from-orange-500 to-red-500',
    lightBg: 'bg-orange-50',
    border: 'border-orange-300',
    badge: 'bg-orange-100 text-orange-700',
    bar: 'bg-gradient-to-r from-orange-400 to-red-500',
    ring: 'ring-orange-300',
    traits: ['Driven', 'Focused', 'Intelligent', 'Courageous', 'Warm'],
  },
  kapha: {
    name: 'Kapha',
    emoji: '🌊',
    elements: 'Water & Earth',
    tagline: 'The Nurturing Force',
    gradient: 'from-teal-500 to-blue-600',
    lightBg: 'bg-teal-50',
    border: 'border-teal-300',
    badge: 'bg-teal-100 text-teal-700',
    bar: 'bg-gradient-to-r from-teal-400 to-blue-500',
    ring: 'ring-teal-300',
    traits: ['Calm', 'Compassionate', 'Loyal', 'Patient', 'Enduring'],
  },
}
