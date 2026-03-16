import { useState } from 'react'

export default function AddExpenseModal({ group, onClose, onAdded }) {
    const members = group.members || []

    const [form, setForm] = useState({
        description: '',
        amount: '',
        category: '',
    })
    const [paidById, setPaidById] = useState(members[0]?.id ?? null)
    const [splitMode, setSplitMode] = useState('equal')
    // who is involved — all by default
    const [involved, setInvolved] = useState(() => new Set(members.map(m => m.id)))
    const [customSplits, setCustomSplits] = useState(
        () => members.reduce((acc, m) => ({ ...acc, [m.id]: '' }), {})
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const inputClass = 'bg-[#0e0f11] border border-[#2a2d35] text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors placeholder:text-[#5c6070] w-full'

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const totalAmount = parseFloat(form.amount) || 0
    const involvedMembers = members.filter(m => involved.has(m.id))

    function toggleInvolved(memberId) {
        setInvolved(prev => {
            const next = new Set(prev)
            if (next.has(memberId)) {
                if (next.size === 1) return prev // keep at least 1
                next.delete(memberId)
                // if paidBy is deselected, reassign to first still-involved member
                if (memberId === paidById) {
                    const remaining = members.filter(m => next.has(m.id))
                    setPaidById(remaining[0]?.id ?? null)
                }
            } else {
                next.add(memberId)
            }
            return next
        })
    }

    function distributeEqually() {
        if (!totalAmount || involvedMembers.length === 0) return
        const share = (totalAmount / involvedMembers.length).toFixed(2)
        setCustomSplits(prev => {
            const next = { ...prev }
            members.forEach(m => { next[m.id] = involved.has(m.id) ? share : '' })
            return next
        })
    }

    const customTotal = involvedMembers.reduce((sum, m) => sum + (parseFloat(customSplits[m.id]) || 0), 0)
    const remaining = totalAmount - customTotal

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (!form.description.trim()) { setError('Description is required'); return }
        if (!totalAmount || totalAmount <= 0) { setError('Enter a valid amount'); return }
        if (involvedMembers.length === 0) { setError('At least one member must be involved'); return }
        if (!paidById) { setError('Select who paid'); return }

        if (splitMode === 'custom' && Math.abs(remaining) > 0.01) {
            setError(`Splits must add up to ₹${totalAmount.toFixed(2)}. Remaining: ₹${remaining.toFixed(2)}`)
            return
        }

        setLoading(true)
        try {
            const payload = {
                description: form.description.trim(),
                amount: totalAmount,
                category: form.category || null,
                paidById: paidById,
            }

            if (splitMode === 'custom') {
                payload.splits = involvedMembers
                    .filter(m => parseFloat(customSplits[m.id]) > 0)
                    .map(m => ({ userId: m.id, shareAmount: parseFloat(customSplits[m.id]) }))
            } else {
                // equal split among involved only
                const share = parseFloat((totalAmount / involvedMembers.length).toFixed(2))
                payload.splits = involvedMembers.map(m => ({ userId: m.id, shareAmount: share }))
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
                    <p className="mt-1 text-sm text-[#9a9da8]">{group.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-[#9a9da8]">
                            Description
                        </label>
                        <input name="description" placeholder="e.g. Hotel booking"
                            value={form.description} onChange={handleChange} className={inputClass} />
                    </div>

                    {/* Amount + Category */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium uppercase tracking-wider text-[#9a9da8]">
                                Amount (₹)
                            </label>
                            <input name="amount" type="number" min="0" step="0.01" placeholder="0.00"
                                value={form.amount} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium uppercase tracking-wider text-[#9a9da8]">
                                Category
                            </label>
                            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                                <option value="">Select...</option>
                                <option>Food</option>
                                <option>Travel</option>
                                <option>Stay</option>
                                <option>Activities</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Paid by */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium uppercase tracking-wider text-[#9a9da8]">
                            Paid by
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {members.map(m => (
                                <button key={m.id} type="button"
                                    onClick={() => setPaidById(m.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
                                        paidById === m.id
                                            ? 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400'
                                            : 'border-[#2a2d35] text-white/40 hover:text-white/70 hover:border-[#363a45]'
                                    }`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                        paidById === m.id
                                            ? 'bg-emerald-400/25 text-emerald-400'
                                            : 'bg-white/[0.07] text-white/40'
                                    }`}>
                                        {m.name[0].toUpperCase()}
                                    </div>
                                    {m.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Split section */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium uppercase tracking-wider text-[#9a9da8]">
                                Split
                            </label>
                            <div className="flex rounded-lg border border-[#2a2d35] overflow-hidden">
                                {['equal', 'custom'].map(mode => (
                                    <button key={mode} type="button"
                                        onClick={() => {
                                            setSplitMode(mode)
                                            if (mode === 'equal') distributeEqually()
                                        }}
                                        className={`px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                                            splitMode === mode
                                                ? 'bg-emerald-400/15 text-emerald-400'
                                                : 'text-[#9a9da8] hover:text-white'
                                        }`}>
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Members involved */}
                        <div className="rounded-xl border border-[#2a2d35] bg-[#0e0f11] p-3 flex flex-col gap-2">
                            {members.map(m => {
                                const isInvolved = involved.has(m.id)
                                return (
                                    <div key={m.id} className={`flex items-center gap-3 rounded-lg px-2 py-1.5 transition-all ${
                                        isInvolved ? '' : 'opacity-40'
                                    }`}>
                                        {/* Toggle involvement */}
                                        <button type="button" onClick={() => toggleInvolved(m.id)}
                                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                                                isInvolved
                                                    ? 'bg-emerald-400 border-emerald-400 text-[#0a1a13]'
                                                    : 'border-[#363a45] hover:border-[#5c6070]'
                                            }`}>
                                            {isInvolved && (
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </button>

                                        <div className="w-6 h-6 rounded-full bg-emerald-400/15 border border-emerald-400/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0">
                                            {m.name[0].toUpperCase()}
                                        </div>

                                        <span className="text-sm text-white/70 flex-1 min-w-0 truncate">{m.name}</span>

                                        {splitMode === 'equal' ? (
                                            <span className="text-xs text-white/30 shrink-0">
                                                {isInvolved && totalAmount > 0
                                                    ? `₹${(totalAmount / involvedMembers.length).toFixed(2)}`
                                                    : '—'}
                                            </span>
                                        ) : (
                                            <input type="number" min="0" step="0.01" placeholder="0.00"
                                                disabled={!isInvolved}
                                                value={isInvolved ? (customSplits[m.id] || '') : ''}
                                                onChange={e => setCustomSplits(prev => ({ ...prev, [m.id]: e.target.value }))}
                                                className="w-24 bg-[#16181c] border border-[#2a2d35] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors text-right disabled:opacity-30 disabled:cursor-not-allowed" />
                                        )}
                                    </div>
                                )
                            })}

                            {/* Custom split footer */}
                            {splitMode === 'custom' && (
                                <div className={`flex items-center justify-between pt-2 mt-1 border-t border-[#2a2d35] text-xs font-medium ${
                                    Math.abs(remaining) < 0.01
                                        ? 'text-emerald-400'
                                        : remaining < 0
                                            ? 'text-red-400'
                                            : 'text-amber-400'
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
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2.5 mt-1">
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