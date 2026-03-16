import { useState } from 'react'

export default function AddExpenseModal({ group, onClose, onAdded }) {
    const [form, setForm] = useState({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().slice(0, 10),
    })
    const [splitMode, setSplitMode] = useState('equal') 
    const [customSplits, setCustomSplits] = useState(
        () => (group.members || []).reduce((acc, m) => ({ ...acc, [m.id]: '' }), {})
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const inputClass = 'bg-[#0e0f11] border border-[#2a2d35] text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors placeholder:text-[#5c6070] w-full'

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const totalAmount = parseFloat(form.amount) || 0
    const customTotal = Object.values(customSplits).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
    const remaining = totalAmount - customTotal

    function distributeEqually() {
        if (!totalAmount || !group.members?.length) return
        const share = (totalAmount / group.members.length).toFixed(2)
        setCustomSplits(group.members.reduce((acc, m) => ({ ...acc, [m.id]: share }), {}))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.description || !form.amount) { setError('Description and amount are required'); return }

        if (splitMode === 'custom') {
            if (Math.abs(remaining) > 0.01) {
                setError(`Splits must add up to ₹${totalAmount.toFixed(2)}. Remaining: ₹${remaining.toFixed(2)}`)
                return
            }
        }

        setLoading(true)
        try {
            const payload = {
                description: form.description,
                amount: totalAmount,
                category: form.category || null,
                date: form.date,
            }
            if (splitMode === 'custom') {
                payload.splits = Object.entries(customSplits)
                    .filter(([, v]) => parseFloat(v) > 0)
                    .map(([userId, shareAmount]) => ({
                        userId: Number(userId),
                        shareAmount: parseFloat(shareAmount),
                    }))
            }
            await onAdded(payload)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add expense')
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-md rounded-2xl border border-[#363a45] bg-[#16181c] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="mb-6">
                    <h2 className="font-serif text-2xl font-normal text-white">Add expense</h2>
                    <p className="mt-1 text-sm text-[#9a9da8]">
                        {group.members?.length} members in this group
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-[#9a9da8]">Description</label>
                        <input name="description" placeholder="e.g. Hotel booking"
                            value={form.description} onChange={handleChange} className={inputClass} />
                    </div>

                    {/* Amount + Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium uppercase tracking-wider text-[#9a9da8]">Amount (₹)</label>
                            <input name="amount" type="number" min="0" step="0.01" placeholder="0.00"
                                value={form.amount} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium uppercase tracking-wider text-[#9a9da8]">Category</label>
                            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                                <option value="">Select...</option>
                                <option>Food</option><option>Travel</option>
                                <option>Stay</option><option>Activities</option><option>Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-[#9a9da8]">Date</label>
                        <input name="date" type="date" value={form.date} onChange={handleChange} className={inputClass} />
                    </div>

                    {/* Split mode toggle */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium uppercase tracking-wider text-[#9a9da8]">Split</label>
                            <div className="flex rounded-lg border border-[#2a2d35] overflow-hidden">
                                {['equal', 'custom'].map(mode => (
                                    <button key={mode} type="button"
                                        onClick={() => { setSplitMode(mode); if (mode === 'equal') distributeEqually() }}
                                        className={`px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                                            splitMode === mode
                                                ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30'
                                                : 'text-[#9a9da8] hover:text-white'
                                        }`}>
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {splitMode === 'equal' ? (
                            <div className="rounded-xl border border-[#2a2d35] bg-[#0e0f11] px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                    {group.members?.map(m => (
                                        <div key={m.id} className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1">
                                            <div className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center text-[9px] text-emerald-400 font-bold">
                                                {m.name[0].toUpperCase()}
                                            </div>
                                            <span className="text-xs text-white/60">{m.name}</span>
                                            {totalAmount > 0 && (
                                                <span className="text-xs text-white/30">
                                                    ₹{(totalAmount / group.members.length).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-[#2a2d35] bg-[#0e0f11] p-3 flex flex-col gap-2">
                                {group.members?.map(m => (
                                    <div key={m.id} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-400/15 border border-emerald-400/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0">
                                            {m.name[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm text-white/70 flex-1 min-w-0 truncate">{m.name}</span>
                                        <input
                                            type="number" min="0" step="0.01" placeholder="0.00"
                                            value={customSplits[m.id] || ''}
                                            onChange={e => setCustomSplits(prev => ({ ...prev, [m.id]: e.target.value }))}
                                            className="w-24 bg-[#16181c] border border-[#2a2d35] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors text-right"
                                        />
                                    </div>
                                ))}
                                {/* Running total */}
                                <div className={`flex items-center justify-between pt-2 mt-1 border-t border-[#2a2d35] text-xs font-medium ${
                                    Math.abs(remaining) < 0.01 ? 'text-emerald-400' : remaining < 0 ? 'text-red-400' : 'text-amber-400'
                                }`}>
                                    <span>
                                        {Math.abs(remaining) < 0.01
                                            ? '✓ Splits balanced'
                                            : remaining > 0
                                                ? `₹${remaining.toFixed(2)} unassigned`
                                                : `₹${Math.abs(remaining).toFixed(2)} over budget`}
                                    </span>
                                    <button type="button" onClick={distributeEqually}
                                        className="text-white/30 hover:text-white/60 transition-colors">
                                        Distribute equally
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="mt-1 flex justify-end gap-2.5">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border border-[#2a2d35] px-4 py-2 text-sm text-[#9a9da8] transition-all hover:bg-[#1e2026] hover:text-white">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#0a1a13] transition-all hover:bg-emerald-300 disabled:opacity-40">
                            {loading ? 'Adding...' : 'Add expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}