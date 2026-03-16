import { useState, useEffect } from 'react'
import { groupService, userService } from '../services'
import { useAuth } from '../context/AuthContext'

export default function CreateGroupModal({ onClose, onCreated }) {
    const { user: currentUser } = useAuth()
    const [name, setName] = useState('')
    const [users, setUsers] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        userService.getAll()
            .then(all => setUsers(all.filter(u => u.email !== currentUser?.email)))
            .catch(() => {})
    }, [currentUser])

    const toggleUser = id => setSelected(s =>
        s.includes(id) ? s.filter(x => x !== id) : [...s, id]
    )

    async function handleSubmit(e) {
        e.preventDefault()
        if (!name.trim()) { setError('Group name is required'); return }
        setLoading(true)
        try {
            const group = await groupService.create({ name, memberIds: selected })
            onCreated(group)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create group')
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "bg-[#0e0f11] border border-[#2a2d35] text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors placeholder:text-[#5c6070] w-full"

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-5"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-[#16181c] border border-[#363a45] rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <div className="mb-6">
                    <h2 className="font-serif text-2xl text-white font-normal mb-1">Create group</h2>
                    <p className="text-sm text-[#9a9da8]">Add members to start splitting expenses</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[#9a9da8] uppercase tracking-wider">Group name</label>
                        <input placeholder="e.g. Goa Trip" value={name}
                            onChange={e => setName(e.target.value)} className={inputClass} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-[#9a9da8] uppercase tracking-wider">Add members</label>
                            {selected.length > 0 && (
                                <span className="text-xs text-emerald-400">{selected.length} selected</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                            {users.length === 0 ? (
                                <p className="text-sm text-[#5c6070] text-center py-4">No other users found</p>
                            ) : users.map(u => (
                                <div key={u.id} onClick={() => toggleUser(u.id)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                                        selected.includes(u.id)
                                            ? 'border-emerald-400/40 bg-emerald-400/[0.06]'
                                            : 'border-[#2a2d35] hover:border-[#363a45] hover:bg-[#1e2026]'
                                    }`}>
                                    <div className="w-8 h-8 rounded-full bg-[#1e2026] border border-[#363a45] flex items-center justify-center text-xs font-semibold text-emerald-400 shrink-0">
                                        {u.name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white">{u.name}</p>
                                        <p className="text-xs text-[#5c6070] truncate">{u.email}</p>
                                    </div>
                                    {selected.includes(u.id) && (
                                        <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center text-[#0a1a13] text-xs font-bold shrink-0">✓</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3.5 py-2.5">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2.5 mt-1">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm text-[#9a9da8] border border-[#2a2d35] rounded-lg hover:text-white hover:bg-[#1e2026] transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-4 py-2 text-sm bg-emerald-400 hover:bg-emerald-300 text-[#0a1a13] font-semibold rounded-lg transition-all disabled:opacity-40">
                            {loading ? 'Creating...' : 'Create group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}