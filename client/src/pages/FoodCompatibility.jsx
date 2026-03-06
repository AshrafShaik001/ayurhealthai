import { useState, useRef, useEffect, useMemo } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

// ── Curated Ayurvedic food list for typeahead ─────────────────
const FOOD_LIST = [
  // Dairy
  'Milk', 'Ghee', 'Butter', 'Yogurt', 'Curd', 'Paneer', 'Buttermilk', 'Cream', 'Cheese',
  // Fruits
  'Banana', 'Apple', 'Mango', 'Papaya', 'Orange', 'Lemon', 'Lime', 'Pomegranate',
  'Watermelon', 'Pineapple', 'Grapes', 'Dates', 'Figs', 'Avocado', 'Coconut', 'Guava',
  'Peach', 'Pear', 'Melon', 'Jackfruit', 'Tamarind', 'Amla',
  // Vegetables
  'Spinach', 'Tomato', 'Onion', 'Garlic', 'Ginger', 'Carrot', 'Beetroot', 'Broccoli',
  'Cauliflower', 'Cucumber', 'Pumpkin', 'Sweet Potato', 'Potato', 'Eggplant', 'Radish',
  'Bottle Gourd', 'Bitter Gourd', 'Drumstick', 'Peas', 'Corn', 'Asparagus', 'Celery',
  // Grains
  'Rice', 'Wheat', 'Barley', 'Oats', 'Millet', 'Quinoa', 'Rye', 'Buckwheat', 'Semolina',
  // Legumes
  'Lentils', 'Chickpeas', 'Moong Dal', 'Toor Dal', 'Kidney Beans', 'Black Beans',
  'Soybeans', 'Tofu', 'Urad Dal', 'Chana Dal',
  // Protein
  'Eggs', 'Chicken', 'Fish', 'Lamb', 'Beef', 'Pork', 'Shrimp',
  // Nuts & Seeds
  'Almonds', 'Walnuts', 'Cashews', 'Pistachios', 'Peanuts', 'Sesame Seeds',
  'Flax Seeds', 'Chia Seeds', 'Pumpkin Seeds', 'Sunflower Seeds',
  // Spices & Herbs
  'Turmeric', 'Cumin', 'Coriander', 'Cardamom', 'Cinnamon', 'Black Pepper',
  'Fenugreek', 'Asafoetida', 'Cloves', 'Nutmeg', 'Saffron', 'Mustard Seeds',
  'Bay Leaves', 'Star Anise', 'Chili', 'Dill', 'Mint', 'Basil', 'Parsley',
  // Oils & Sweeteners
  'Coconut Oil', 'Olive Oil', 'Sesame Oil', 'Mustard Oil', 'Honey', 'Jaggery', 'Sugar',
  // Beverages / Other
  'Green Tea', 'Coffee', 'Black Tea', 'Aloe Vera', 'Neem', 'Ashwagandha', 'Triphala',
].sort()

const MAX_FOODS = 6

// ── Status configs ─────────────────────────────────────────────
const STATUS = {
  good:    { icon: '✅', label: 'Compatible',   bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  bad:     { icon: '❌', label: 'Incompatible', bg: 'bg-red-50',      border: 'border-red-200',     text: 'text-red-700',     badge: 'bg-red-100 text-red-700' },
  neutral: { icon: '⚠️', label: 'Neutral',      bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700' },
}

const EFFECT = {
  balances:   { icon: '✅', text: 'text-emerald-700', bg: 'bg-emerald-50',  label: 'Balances' },
  aggravates: { icon: '❌', text: 'text-red-700',     bg: 'bg-red-50',      label: 'Aggravates' },
  neutral:    { icon: '⚪', text: 'text-gray-600',    bg: 'bg-gray-50',     label: 'Neutral' },
}

// ── Score ring component ──────────────────────────────────────
function ScoreRing({ score }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626'
  const offset = circ - (score / 100) * circ

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 56 56)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-400 font-medium">/ 100</span>
      </div>
    </div>
  )
}

// ── Food chip ──────────────────────────────────────────────────
function FoodChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-ayur-leaf/10 text-ayur-bark text-sm font-medium px-3 py-1.5 rounded-xl border border-ayur-leaf/30">
      🌿 {label}
      <button
        onClick={onRemove}
        className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold leading-none"
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  )
}

// ── Combination card ──────────────────────────────────────────
function CombinationCard({ combo }) {
  const cfg = STATUS[combo.status] || STATUS.neutral
  const [open, setOpen] = useState(combo.status === 'bad')

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      {/* Header row */}
      <button
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xl flex-shrink-0">{cfg.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-ayur-bark text-sm">{combo.food1}</span>
              <span className="text-gray-400 text-sm">+</span>
              <span className="font-semibold text-ayur-bark text-sm">{combo.food2}</span>
            </div>
            {/* Collapsed preview */}
            {!open && combo.reason && (
              <p className="text-xs text-gray-500 truncate mt-0.5 max-w-xs">{combo.reason}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
            {cfg.label}
          </span>
          <span className={`text-gray-400 transition-transform duration-200 text-xs ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-4 pb-4 border-t border-white/60 pt-3 space-y-2">
          {combo.reason && (
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0 mt-0.5">📖</span>
              <p className="text-sm text-gray-700 leading-relaxed">{combo.reason}</p>
            </div>
          )}
          {combo.status === 'bad' && combo.remedy && (
            <div className="flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2.5 border border-amber-200">
              <span className="text-base flex-shrink-0 mt-0.5">💊</span>
              <div>
                <p className="text-xs font-bold text-amber-700 mb-0.5">Remedy</p>
                <p className="text-sm text-gray-700 leading-relaxed">{combo.remedy}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Loading skeleton ───────────────────────────────────────────
function ResultSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-5">
          <div className="w-28 h-28 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
            <div className="h-3 bg-gray-100 rounded w-3/5" />
          </div>
        </div>
      </div>
      {[1,2,3].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function FoodCompatibility() {
  const { user } = useAuth()

  const defaultDosha = user?.existingDosha && user.existingDosha !== 'Unknown'
    ? user.existingDosha
    : 'Vata'

  const [dosha,       setDosha]       = useState(defaultDosha)
  const [foods,       setFoods]       = useState([])
  const [query,       setQuery]       = useState('')
  const [dropOpen,    setDropOpen]    = useState(false)
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [filterTab,   setFilterTab]   = useState('all') // 'all' | 'bad' | 'good' | 'neutral'

  const inputRef     = useRef(null)
  const dropdownRef  = useRef(null)
  const resultsRef   = useRef(null)

  // ── Filtered suggestions ──────────────────────────────────
  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return FOOD_LIST
      .filter(f => f.toLowerCase().includes(q) && !foods.includes(f))
      .slice(0, 8)
  }, [query, foods])

  // ── Click outside closes dropdown ─────────────────────────
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Add food ──────────────────────────────────────────────
  function addFood(food) {
    if (foods.length >= MAX_FOODS || foods.includes(food)) return
    setFoods(prev => [...prev, food])
    setQuery('')
    setDropOpen(false)
    setResult(null)
    inputRef.current?.focus()
  }

  // Allow adding custom food (not in list) on Enter
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const custom = query.trim()
      if (custom.length > 1 && !foods.includes(custom) && foods.length < MAX_FOODS) {
        addFood(custom.charAt(0).toUpperCase() + custom.slice(1))
      } else if (suggestions.length > 0) {
        addFood(suggestions[0])
      }
    }
    if (e.key === 'Escape') {
      setDropOpen(false)
      setQuery('')
    }
  }

  // ── Remove food ───────────────────────────────────────────
  function removeFood(food) {
    setFoods(prev => prev.filter(f => f !== food))
    setResult(null)
  }

  // ── Check compatibility ───────────────────────────────────
  async function handleCheck() {
    if (foods.length < 2) {
      setError('Please add at least 2 foods.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)

    try {
      const { data } = await api.post('/api/food-compatibility', { foods, dosha })
      if (data.success) {
        setResult(data.result)
        setFilterTab('all')
        // Scroll to results
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Compatibility check failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Filtered combinations ─────────────────────────────────
  const filteredCombos = useMemo(() => {
    if (!result?.combinations) return []
    if (filterTab === 'all') return result.combinations
    return result.combinations.filter(c => c.status === filterTab)
  }, [result, filterTab])

  const badCount     = result?.combinations?.filter(c => c.status === 'bad').length    ?? 0
  const goodCount    = result?.combinations?.filter(c => c.status === 'good').length   ?? 0
  const neutralCount = result?.combinations?.filter(c => c.status === 'neutral').length ?? 0

  const overallLabel = !result ? '' :
    result.overall_score >= 75 ? 'Great combination!' :
    result.overall_score >= 50 ? 'Mostly compatible' :
    result.overall_score >= 25 ? 'Use caution' : 'Poor combination'

  const overallColor = !result ? '' :
    result.overall_score >= 75 ? 'text-emerald-600' :
    result.overall_score >= 50 ? 'text-amber-600'  :
    'text-red-600'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ayur-cream to-green-50">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-ayur-leaf to-primary-800 text-white px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🥗</span>
            <div>
              <h1 className="text-2xl font-bold">Food Compatibility Checker</h1>
              <p className="text-green-100 text-sm mt-0.5">
                Discover which foods harmonise for your dosha — powered by Ayurvedic AI
              </p>
            </div>
          </div>
          {user?.existingDosha && user.existingDosha !== 'Unknown' && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              🧬 Checking for: <span className="font-bold">{user.existingDosha} dosha</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* ── Input Panel ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Dosha selector */}
          <div className="mb-5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">🧬 Your Dosha</label>
            <div className="flex gap-2">
              {['Vata', 'Pitta', 'Kapha'].map(d => (
                <button
                  key={d}
                  onClick={() => { setDosha(d); setResult(null) }}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                    dosha === d
                      ? 'bg-ayur-leaf text-white border-ayur-leaf shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-ayur-leaf hover:text-ayur-leaf'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Food search */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                🌿 Add Foods
              </label>
              <span className={`text-xs font-semibold ${foods.length >= MAX_FOODS ? 'text-amber-600' : 'text-gray-400'}`}>
                {foods.length}/{MAX_FOODS} foods
              </span>
            </div>

            {/* Search input + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-white transition-all ${
                dropOpen ? 'border-ayur-leaf ring-2 ring-ayur-leaf/20' : 'border-gray-200'
              } ${foods.length >= MAX_FOODS ? 'opacity-50 pointer-events-none' : ''}`}>
                <span className="text-gray-400">🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  disabled={foods.length >= MAX_FOODS}
                  onChange={e => { setQuery(e.target.value); setDropOpen(true) }}
                  onFocus={() => query && setDropOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder={foods.length >= MAX_FOODS ? 'Maximum 6 foods selected' : 'Search foods… (e.g. Milk, Banana, Rice)'}
                  className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                />
                {query && (
                  <button onClick={() => { setQuery(''); setDropOpen(false) }} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
                )}
              </div>

              {/* Dropdown */}
              {dropOpen && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map(food => (
                    <button
                      key={food}
                      onMouseDown={e => { e.preventDefault(); addFood(food) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-ayur-bark transition-colors flex items-center gap-2"
                    >
                      <span className="text-ayur-leaf">🌿</span> {food}
                    </button>
                  ))}
                  {/* Custom add hint */}
                  <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
                    Press Enter to add "{query}" as a custom food
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-1.5">
              Type to search, or press Enter to add a custom food. Add 2–6 foods.
            </p>
          </div>

          {/* Food chips */}
          {foods.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {foods.map(food => (
                <FoodChip key={food} label={food} onRemove={() => removeFood(food)} />
              ))}
            </div>
          )}

          {/* Quick-add popular combos */}
          {foods.length === 0 && (
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Try a classic combo</p>
              <div className="flex flex-wrap gap-2">
                {[
                  ['Milk', 'Banana', 'Honey'],
                  ['Rice', 'Lentils', 'Ghee'],
                  ['Yogurt', 'Fruit', 'Honey'],
                  ['Fish', 'Milk'],
                ].map(combo => (
                  <button
                    key={combo.join('+')}
                    onClick={() => {
                      const toAdd = combo.filter(f => !foods.includes(f)).slice(0, MAX_FOODS - foods.length)
                      setFoods(prev => [...prev, ...toAdd])
                      setResult(null)
                    }}
                    className="text-xs text-ayur-leaf border border-ayur-leaf/30 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-lg font-medium transition-colors"
                  >
                    {combo.join(' + ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Check button */}
          <button
            onClick={handleCheck}
            disabled={foods.length < 2 || loading}
            className={`w-full py-3 rounded-xl text-sm font-bold text-white shadow-sm transition-all inline-flex items-center justify-center gap-2
              ${foods.length >= 2 && !loading
                ? 'hover:opacity-90 active:scale-[0.99] cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
              }`}
            style={{ background: 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
          >
            {loading ? (
              <><span className="animate-spin">🌀</span> Checking with Ayurvedic AI…</>
            ) : (
              <><span>🔬</span> Check Compatibility</>
            )}
          </button>

          {foods.length < 2 && !loading && (
            <p className="text-center text-xs text-gray-400 mt-2">Add at least 2 foods to check compatibility</p>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
              <span className="animate-spin inline-block">🌿</span>
              Our Ayurvedic AI is analysing food combinations…
            </p>
            <ResultSkeleton />
          </div>
        )}

        {/* ── Results ── */}
        {!loading && result && (
          <div ref={resultsRef} className="space-y-5">
            {/* Overall summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-5">
                <ScoreRing score={result.overall_score} />
                <div className="flex-1 min-w-0">
                  <div className={`text-xl font-black mb-0.5 ${overallColor}`}>{overallLabel}</div>
                  <p className="text-xs text-gray-500 mb-3">
                    Compatibility score for <strong className="text-ayur-bark">{foods.join(', ')}</strong> with <strong className="text-ayur-bark">{dosha} dosha</strong>
                  </p>
                  {/* Mini stats */}
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { label: 'Good pairs',    count: goodCount,    color: 'text-emerald-600', dot: 'bg-emerald-500' },
                      { label: 'Bad pairs',     count: badCount,     color: 'text-red-600',     dot: 'bg-red-500'     },
                      { label: 'Neutral pairs', count: neutralCount, color: 'text-amber-600',   dot: 'bg-amber-500'   },
                    ].map(({ label, count, color, dot }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dot}`} />
                        <span className={`text-xs font-semibold ${color}`}>{count}</span>
                        <span className="text-xs text-gray-400">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overall advice */}
              {result.overall_advice && (
                <div className="mt-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex gap-2 items-start">
                  <span className="text-lg flex-shrink-0">💬</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{result.overall_advice}</p>
                </div>
              )}
            </div>

            {/* ── Dosha analysis ── */}
            {result.dosha_analysis?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-ayur-bark mb-4 flex items-center gap-2">
                  🧬 How each food affects your <span className="text-ayur-leaf">{dosha}</span> dosha
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.dosha_analysis.map((item, i) => {
                    const eff = EFFECT[item.effect] || EFFECT.neutral
                    return (
                      <div key={i} className={`flex items-start gap-3 rounded-xl p-3 border ${eff.bg} border-gray-100`}>
                        <span className="text-lg flex-shrink-0 mt-0.5">{eff.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="text-sm font-semibold text-ayur-bark">{item.food}</span>
                            <span className={`text-xs font-bold ${eff.text}`}>{eff.label}</span>
                          </div>
                          {item.note && (
                            <p className="text-xs text-gray-500 leading-relaxed">{item.note}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Combinations ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Filter tabs */}
              <div className="flex items-center gap-1 p-3 border-b border-gray-100 bg-slate-50/60 flex-wrap">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Filter:</span>
                {[
                  { id: 'all',     label: `All (${result.combinations?.length ?? 0})` },
                  { id: 'bad',     label: `❌ Bad (${badCount})` },
                  { id: 'good',    label: `✅ Good (${goodCount})` },
                  { id: 'neutral', label: `⚠️ Neutral (${neutralCount})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filterTab === tab.id
                        ? 'bg-ayur-leaf text-white shadow-sm'
                        : 'text-gray-500 hover:bg-white hover:text-ayur-bark'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4 space-y-3">
                {filteredCombos.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-6">No {filterTab} combinations found.</p>
                ) : (
                  filteredCombos.map((combo, i) => (
                    <CombinationCard key={i} combo={combo} />
                  ))
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-gray-400 pb-4">
              This analysis is AI-generated based on Ayurvedic principles. Consult an Ayurvedic practitioner for personalised dietary guidance.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
