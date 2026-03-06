// Symptom categories with dosha associations.
// doshas: which doshas this symptom is a primary indicator of when imbalanced.

export const SYMPTOM_CATEGORIES = [
  {
    id:    'physical',
    label: 'Physical',
    icon:  '🏃',
    color: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', active: 'bg-emerald-500' },
    symptoms: [
      { id: 'p1',  label: 'Dry or flaky skin',             doshas: ['vata']         },
      { id: 'p2',  label: 'Joint pain or stiffness',        doshas: ['vata']         },
      { id: 'p3',  label: 'Cold hands and feet',            doshas: ['vata']         },
      { id: 'p4',  label: 'Headaches or migraines',         doshas: ['vata','pitta'] },
      { id: 'p5',  label: 'Skin inflammation or redness',   doshas: ['pitta']        },
      { id: 'p6',  label: 'Excessive sweating or body heat',doshas: ['pitta']        },
      { id: 'p7',  label: 'Unexplained weight gain',        doshas: ['kapha']        },
      { id: 'p8',  label: 'Water retention or puffiness',   doshas: ['kapha']        },
      { id: 'p9',  label: 'Muscle cramps or spasms',        doshas: ['vata']         },
      { id: 'p10', label: 'Sensitivity to heat',            doshas: ['pitta']        },
    ],
  },
  {
    id:    'digestive',
    label: 'Digestive',
    icon:  '🫁',
    color: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', active: 'bg-amber-500' },
    symptoms: [
      { id: 'd1',  label: 'Bloating after meals',           doshas: ['vata']         },
      { id: 'd2',  label: 'Gas or flatulence',              doshas: ['vata']         },
      { id: 'd3',  label: 'Chronic constipation',           doshas: ['vata']         },
      { id: 'd4',  label: 'Acid reflux or heartburn',       doshas: ['pitta']        },
      { id: 'd5',  label: 'Loose stools or diarrhoea',      doshas: ['pitta']        },
      { id: 'd6',  label: 'Nausea',                         doshas: ['pitta','kapha']},
      { id: 'd7',  label: 'Slow or heavy digestion',        doshas: ['kapha']        },
      { id: 'd8',  label: 'Poor or absent appetite',        doshas: ['kapha','vata'] },
      { id: 'd9',  label: 'Intense or insatiable hunger',   doshas: ['pitta']        },
      { id: 'd10', label: 'Food cravings (sweet or oily)',  doshas: ['kapha','vata'] },
    ],
  },
  {
    id:    'mental',
    label: 'Mental & Emotional',
    icon:  '🧠',
    color: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', active: 'bg-violet-500' },
    symptoms: [
      { id: 'm1',  label: 'Anxiety or nervousness',         doshas: ['vata']         },
      { id: 'm2',  label: 'Worry or fearfulness',           doshas: ['vata']         },
      { id: 'm3',  label: 'Irritability or short temper',   doshas: ['pitta']        },
      { id: 'm4',  label: 'Anger or frustration',           doshas: ['pitta']        },
      { id: 'm5',  label: 'Sadness or low mood',            doshas: ['kapha']        },
      { id: 'm6',  label: 'Brain fog or poor memory',       doshas: ['kapha','vata'] },
      { id: 'm7',  label: 'Overthinking or racing thoughts',doshas: ['vata']         },
      { id: 'm8',  label: 'Perfectionism or control issues',doshas: ['pitta']        },
      { id: 'm9',  label: 'Low motivation or apathy',       doshas: ['kapha']        },
      { id: 'm10', label: 'Mood swings',                    doshas: ['vata','pitta'] },
    ],
  },
  {
    id:    'energy',
    label: 'Energy & Sleep',
    icon:  '⚡',
    color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', active: 'bg-blue-500' },
    symptoms: [
      { id: 'e1',  label: 'Chronic fatigue or exhaustion',  doshas: ['vata','kapha'] },
      { id: 'e2',  label: 'Difficulty falling asleep',      doshas: ['vata']         },
      { id: 'e3',  label: 'Waking up at night',             doshas: ['vata']         },
      { id: 'e4',  label: 'Oversleeping or hard to wake up',doshas: ['kapha']        },
      { id: 'e5',  label: 'Afternoon energy crash',         doshas: ['pitta','kapha']},
      { id: 'e6',  label: 'Low stamina or endurance',       doshas: ['vata','kapha'] },
      { id: 'e7',  label: 'Restlessness or inability to relax', doshas: ['vata','pitta'] },
      { id: 'e8',  label: 'Morning grogginess',             doshas: ['kapha']        },
    ],
  },
  {
    id:    'skin',
    label: 'Skin, Hair & Respiratory',
    icon:  '🌸',
    color: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', active: 'bg-rose-500' },
    symptoms: [
      { id: 'sk1', label: 'Dry, brittle, or thinning hair', doshas: ['vata']         },
      { id: 'sk2', label: 'Oily skin or scalp',             doshas: ['pitta','kapha']},
      { id: 'sk3', label: 'Acne or frequent breakouts',     doshas: ['pitta']        },
      { id: 'sk4', label: 'Eczema or psoriasis',            doshas: ['pitta','vata'] },
      { id: 'sk5', label: 'Nasal congestion or sinusitis',  doshas: ['kapha']        },
      { id: 'sk6', label: 'Frequent colds or low immunity', doshas: ['kapha','vata'] },
      { id: 'sk7', label: 'Persistent cough or mucus',      doshas: ['kapha']        },
      { id: 'sk8', label: 'Brittle nails',                  doshas: ['vata']         },
    ],
  },
]

// Flat list for quick lookup
export const ALL_SYMPTOMS = SYMPTOM_CATEGORIES.flatMap(c => c.symptoms)

// Calculate preliminary dosha imbalance scores from selected symptom IDs
export function calcDoshaScores(selectedIds) {
  const counts = { vata: 0, pitta: 0, kapha: 0 }
  selectedIds.forEach(id => {
    const sym = ALL_SYMPTOMS.find(s => s.id === id)
    if (!sym) return
    sym.doshas.forEach(d => {
      counts[d] += 1 / sym.doshas.length   // split evenly if multi-dosha
    })
  })
  const total = counts.vata + counts.pitta + counts.kapha || 1
  return {
    vata:  Math.round((counts.vata  / total) * 100),
    pitta: Math.round((counts.pitta / total) * 100),
    kapha: Math.round((counts.kapha / total) * 100),
  }
}
