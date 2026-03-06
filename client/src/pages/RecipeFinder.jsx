import { useState, useEffect, useCallback } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

// ── Constants ─────────────────────────────────────────────────
const DOSHAS    = ['Vata', 'Pitta', 'Kapha']
const SEASONS   = ['Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter']
const GOALS     = ['Weight Loss', 'Energy', 'Digestion', 'Immunity', 'Sleep']
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const DOSHA_COLORS = {
  Vata:  { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200' },
  Pitta: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  Kapha: { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200' },
}

const SEASON_EMOJI = {
  Spring: '🌸', Summer: '☀️', Monsoon: '🌧️', Autumn: '🍂', Winter: '❄️',
}

const GOAL_EMOJI = {
  'Weight Loss': '⚖️', Energy: '⚡', Digestion: '🔥', Immunity: '🛡️', Sleep: '🌙',
}

// ── Dosha Chip ────────────────────────────────────────────────
function DoshaChip({ dosha, type }) {
  const colors = DOSHA_COLORS[dosha] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
      {type === 'balances' ? '✅' : '❌'} {dosha}
    </span>
  )
}

// ── Recipe Card ───────────────────────────────────────────────
function RecipeCard({ recipe, isSaved, onSave, onUnsave, savedId }) {
  const [expanded, setExpanded] = useState(false)
  const [saving,   setSaving]   = useState(false)

  async function handleSaveToggle() {
    setSaving(true)
    try {
      if (isSaved) {
        await onUnsave(savedId)
      } else {
        await onSave(recipe)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 pb-3 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-ayur-bark leading-tight mb-1">{recipe.name}</h3>
            {recipe.description && (
              <p className="text-xs text-gray-500 leading-relaxed">{recipe.description}</p>
            )}
          </div>
          {/* Save button */}
          <button
            onClick={handleSaveToggle}
            disabled={saving}
            title={isSaved ? 'Remove from favourites' : 'Save to favourites'}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${
              isSaved
                ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-ayur-leaf/10 hover:border-ayur-leaf hover:text-ayur-leaf'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? (
              <span className="animate-spin text-sm">🌀</span>
            ) : (
              <span className="text-base">{isSaved ? '❤️' : '🤍'}</span>
            )}
          </button>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.meal_type && (
            <span className="text-xs bg-ayur-cream text-ayur-bark font-medium px-2 py-0.5 rounded-full border border-ayur-gold/20">
              🍽️ {recipe.meal_type}
            </span>
          )}
          {recipe.best_season && (
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
              {SEASON_EMOJI[recipe.best_season] || '🌿'} {recipe.best_season}
            </span>
          )}
          {recipe.prep_time && (
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
              ⏱ Prep {recipe.prep_time}
            </span>
          )}
          {recipe.cook_time && (
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
              🔥 Cook {recipe.cook_time}
            </span>
          )}
        </div>

        {/* Dosha balancing */}
        {(recipe.balances_dosha?.length > 0 || recipe.aggravates_dosha?.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.balances_dosha?.map(d   => <DoshaChip key={`b-${d}`} dosha={d} type="balances" />)}
            {recipe.aggravates_dosha?.map(d => <DoshaChip key={`a-${d}`} dosha={d} type="aggravates" />)}
          </div>
        )}

        {/* Health benefits */}
        {recipe.health_benefits && (
          <p className="text-xs text-ayur-leaf font-medium bg-green-50 rounded-lg px-3 py-2 border border-green-100">
            💚 {recipe.health_benefits}
          </p>
        )}
      </div>

      {/* Expand / Collapse */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm font-semibold text-ayur-bark hover:bg-gray-50 transition-colors"
      >
        <span>{expanded ? 'Hide details' : 'See ingredients & steps'}</span>
        <span className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 bg-slate-50/60">
          {/* Ingredients */}
          {recipe.ingredients?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ingredients</h4>
              <ul className="space-y-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-ayur-leaf mt-0.5 flex-shrink-0">•</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps */}
          {recipe.steps?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preparation</h4>
              <ol className="space-y-2">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ayur-leaf text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Filter Pill ────────────────────────────────────────────────
function FilterPill({ label, emoji, value, selected, onClick, colorClass = '' }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all
        ${selected
          ? `bg-ayur-leaf text-white border-ayur-leaf shadow-sm ${colorClass}`
          : 'bg-white text-gray-600 border-gray-200 hover:border-ayur-leaf hover:text-ayur-leaf'
        }`}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </button>
  )
}

// ── Loading Skeleton ──────────────────────────────────────────
function RecipeSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-5 bg-gray-200 rounded w-3/5" />
        <div className="h-9 w-9 bg-gray-100 rounded-xl" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-4/5 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
      <div className="flex gap-2 mb-3">
        {[1,2,3].map(i => <div key={i} className="h-5 w-16 bg-gray-100 rounded-full" />)}
      </div>
      <div className="h-8 bg-green-50 rounded-lg" />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function RecipeFinder() {
  const { user } = useAuth()

  // Derive default dosha from user profile
  const defaultDosha = user?.existingDosha && user.existingDosha !== 'Unknown'
    ? user.existingDosha
    : 'Vata'

  const [filters, setFilters] = useState({
    dosha:    defaultDosha,
    season:   '',
    goal:     '',
    mealType: '',
  })
  const [recipes,     setRecipes]     = useState([])
  const [savedMap,    setSavedMap]    = useState({}) // name → { saved: true, id: string }
  const [loading,     setLoading]     = useState(false)
  const [loadingSaved,setLoadingSaved]= useState(true)
  const [error,       setError]       = useState('')
  const [generated,   setGenerated]   = useState(false)
  const [activeTab,   setActiveTab]   = useState('generate') // 'generate' | 'saved'
  const [savedRecipes,setSavedRecipes]= useState([])

  // ── Fetch saved recipes on mount ──────────────────────────
  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true)
    try {
      const { data } = await api.get('/api/recipes/saved')
      if (data.success) {
        setSavedRecipes(data.recipes)
        const map = {}
        data.recipes.forEach(r => { map[r.name] = { saved: true, id: r._id } })
        setSavedMap(map)
      }
    } catch (e) {
      console.error('fetchSaved error:', e)
    } finally {
      setLoadingSaved(false)
    }
  }, [])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  // ── Generate recipes ──────────────────────────────────────
  async function handleGenerate() {
    if (!filters.dosha || !filters.season || !filters.goal || !filters.mealType) {
      setError('Please select all filters before generating.')
      return
    }
    setError('')
    setLoading(true)
    setGenerated(false)
    setRecipes([])

    try {
      const { data } = await api.post('/api/recipes/generate', filters)
      if (data.success) {
        setRecipes(data.recipes)
        setGenerated(true)
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to generate recipes. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Save recipe ───────────────────────────────────────────
  async function handleSave(recipe) {
    try {
      const { data } = await api.post('/api/recipes/save', { recipe, filters })
      if (data.success) {
        setSavedMap(prev => ({ ...prev, [recipe.name]: { saved: true, id: data.savedRecipe._id } }))
        setSavedRecipes(prev => [data.savedRecipe, ...prev])
      }
    } catch (e) {
      console.error('save error:', e)
    }
  }

  // ── Unsave recipe ─────────────────────────────────────────
  async function handleUnsave(savedId, recipeName) {
    try {
      await api.delete(`/api/recipes/save/${savedId}`)
      setSavedMap(prev => {
        const next = { ...prev }
        delete next[recipeName]
        return next
      })
      setSavedRecipes(prev => prev.filter(r => r._id !== savedId))
    } catch (e) {
      console.error('unsave error:', e)
    }
  }

  const allFiltersSet = filters.dosha && filters.season && filters.goal && filters.mealType

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-ayur-cream to-green-50">
      {/* ── Page Header ── */}
      <div className="bg-gradient-to-r from-ayur-leaf to-primary-800 text-white px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🍲</span>
            <div>
              <h1 className="text-2xl font-bold">Ayurvedic Recipe Finder</h1>
              <p className="text-green-100 text-sm mt-0.5">
                AI-generated healing recipes tailored to your dosha &amp; season
              </p>
            </div>
          </div>
          {user?.existingDosha && user.existingDosha !== 'Unknown' && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              🧬 Your dosha: <span className="font-bold">{user.existingDosha}</span> (auto-filled from your profile)
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ── Tab Switch ── */}
        <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl w-fit mb-8 shadow-sm">
          {[
            { id: 'generate', label: '✨ Generate Recipes' },
            { id: 'saved',    label: `❤️ Saved (${savedRecipes.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-ayur-leaf text-white shadow-sm'
                  : 'text-gray-500 hover:text-ayur-bark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* GENERATE TAB */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'generate' && (
          <div className="space-y-8">
            {/* ── Filter Panel ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-ayur-bark mb-5">Customise Your Recipes</h2>

              <div className="space-y-5">
                {/* Dosha */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    🧬 Your Dosha
                    {user?.existingDosha && user.existingDosha !== 'Unknown' && (
                      <span className="ml-2 text-ayur-leaf normal-case font-normal">(from your profile)</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DOSHAS.map(d => (
                      <FilterPill
                        key={d}
                        label={d}
                        value={d}
                        selected={filters.dosha === d}
                        onClick={v => setFilters(f => ({ ...f, dosha: v }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Season */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">🌿 Season</label>
                  <div className="flex flex-wrap gap-2">
                    {SEASONS.map(s => (
                      <FilterPill
                        key={s}
                        label={s}
                        emoji={SEASON_EMOJI[s]}
                        value={s}
                        selected={filters.season === s}
                        onClick={v => setFilters(f => ({ ...f, season: v }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Health Goal */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">🎯 Health Goal</label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map(g => (
                      <FilterPill
                        key={g}
                        label={g}
                        emoji={GOAL_EMOJI[g]}
                        value={g}
                        selected={filters.goal === g}
                        onClick={v => setFilters(f => ({ ...f, goal: v }))}
                      />
                    ))}
                  </div>
                </div>

                {/* Meal Type */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">🍽️ Meal Type</label>
                  <div className="flex flex-wrap gap-2">
                    {MEAL_TYPES.map(m => (
                      <FilterPill
                        key={m}
                        label={m}
                        value={m}
                        selected={filters.mealType === m}
                        onClick={v => setFilters(f => ({ ...f, mealType: v }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !allFiltersSet}
                  className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-sm transition-all
                    ${allFiltersSet && !loading
                      ? 'hover:opacity-90 active:scale-95 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                    }`}
                  style={{ background: 'linear-gradient(135deg, #3d6b1f 0%, #5a8a3c 50%, #c9a84c 100%)' }}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">🌀</span>
                      Generating with AI…
                    </>
                  ) : (
                    <>✨ Generate Recipes</>
                  )}
                </button>
                {!allFiltersSet && (
                  <p className="text-xs text-gray-400">Select all filters to generate recipes</p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                  <span>⚠️</span> {error}
                </div>
              )}
            </div>

            {/* ── Loading Skeletons ── */}
            {loading && (
              <div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <span className="animate-spin inline-block">🌿</span>
                  Our Ayurvedic AI is crafting personalised recipes for you…
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[1, 2, 3].map(i => <RecipeSkeleton key={i} />)}
                </div>
              </div>
            )}

            {/* ── Recipe Cards ── */}
            {!loading && generated && recipes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-ayur-bark">
                    3 Recipes for {filters.dosha} · {filters.season} · {filters.goal}
                  </h2>
                  <span className="text-xs text-gray-400">Click a card to expand ingredients &amp; steps</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {recipes.map((recipe, i) => {
                    const savedInfo = savedMap[recipe.name]
                    return (
                      <RecipeCard
                        key={i}
                        recipe={recipe}
                        isSaved={!!savedInfo}
                        savedId={savedInfo?.id}
                        onSave={handleSave}
                        onUnsave={(id) => handleUnsave(id, recipe.name)}
                      />
                    )
                  })}
                </div>
                <p className="text-center text-xs text-gray-400 mt-6">
                  These recipes are AI-generated Ayurvedic suggestions. Consult an Ayurvedic practitioner for personalised dietary advice.
                </p>
              </div>
            )}

            {/* ── Empty state (after generate, 0 recipes) ── */}
            {!loading && generated && recipes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🍃</div>
                <p className="text-gray-500">No recipes returned. Please try different filters.</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* SAVED TAB */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'saved' && (
          <div>
            {loadingSaved ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => <RecipeSkeleton key={i} />)}
              </div>
            ) : savedRecipes.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🤍</div>
                <h3 className="text-lg font-semibold text-ayur-bark mb-2">No saved recipes yet</h3>
                <p className="text-gray-500 text-sm mb-6">Generate some recipes and tap the heart to save your favourites here.</p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="btn-primary text-sm px-6 py-2.5"
                >
                  ✨ Generate Recipes
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-ayur-bark mb-5">Your Favourite Recipes ({savedRecipes.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {savedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe._id}
                      recipe={recipe}
                      isSaved={true}
                      savedId={recipe._id}
                      onSave={handleSave}
                      onUnsave={(id) => handleUnsave(id, recipe.name)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
