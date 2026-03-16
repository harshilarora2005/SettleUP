import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../context/AuthContext'
import { fetchGroupById, leaveGroup, deleteGroup } from '../store/groupSlice'
import {
    fetchExpenses, addExpense, deleteExpense,
    fetchSettlementPlan, clearExpenses,
} from '../store/expenseSlice'
import AddExpenseModal from '../components/AddExpenseModal'

const categoryIcon = (category) =>
    ({ Food: '🍴', Travel: '✈️', Stay: '🏠', Activities: '⚡', Other: '•' }[category] || '•')

export default function GroupDetails() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [showModal, setShowModal] = useState(false)
    const [showLeaveModal, setShowLeaveModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [leaveLoading, setLeaveLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('expenses')

    const { current: group, currentLoading } = useSelector(s => s.groups)
    const { list: expenses, settlements, loading, settleLoading } = useSelector(s => s.expenses)

    useEffect(() => {
        dispatch(fetchGroupById(id))
        dispatch(fetchExpenses(id))
        dispatch(fetchSettlementPlan(id))
        return () => { dispatch(clearExpenses()) }
    }, [id, dispatch])

    async function handleAddExpense(data) {
        await dispatch(addExpense({ ...data, groupId: Number(id) }))
        dispatch(fetchSettlementPlan(id))
        setShowModal(false)
    }

    async function handleDelete(expenseId) {
        await dispatch(deleteExpense(expenseId))
        dispatch(fetchSettlementPlan(id))
    }

    async function handleLeaveConfirm() {
        setLeaveLoading(true)
        await dispatch(leaveGroup(Number(id)))
        navigate('/groups')
    }

    async function handleDeleteConfirm() {
        setDeleteLoading(true)
        await dispatch(deleteGroup(Number(id)))
        navigate('/groups')
    }

    if (currentLoading) return (
        <div className="flex items-center justify-center py-32">
            <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
            </div>
        </div>
    )

    if (!group) return (
        <div className="py-32 text-center text-sm text-[#5c6070]">Group not found.</div>
    )

    const isCreator = group.createdBy?.email === user?.email
    const totalSpend = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)

    return (
        <div className="mx-auto max-w-3xl px-6 py-10 pb-20">

            {/* Back */}
            <button onClick={() => navigate('/groups')}
                className="mb-6 flex items-center gap-1.5 text-sm text-[#9a9da8] transition-colors hover:text-white">
                ← Back
            </button>

            {/* Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 font-serif text-2xl text-emerald-400">
                        {group.name[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 className="mb-2 font-serif text-3xl font-normal text-white">{group.name}</h1>
                        <div className="flex flex-wrap gap-1.5">
                            {group.members?.map(member => (
                                <span key={member.id}
                                    className="rounded-full border border-[#2a2d35] bg-[#1e2026] px-2.5 py-1 text-xs text-[#9a9da8]">
                                    {member.name}
                                    {member.email === user?.email && (
                                        <span className="ml-1 text-white/20">(you)</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {isCreator ? (
                        <button onClick={() => setShowDeleteModal(true)}
                            className="rounded-lg border border-red-400/20 px-4 py-2 text-sm font-medium text-red-400/60 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/30 transition-all">
                            Delete group
                        </button>
                    ) : (
                        <button onClick={() => setShowLeaveModal(true)}
                            className="rounded-lg border border-red-400/20 px-4 py-2 text-sm font-medium text-red-400/60 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/30 transition-all">
                            Leave group
                        </button>
                    )}
                    <button onClick={() => setShowModal(true)}
                        className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#0a1a13] transition-all hover:bg-emerald-300">
                        + Add expense
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-4 gap-3">
                {[
                    { value: `₹${totalSpend.toFixed(0)}`, label: 'Total spent' },
                    { value: expenses.length, label: 'Expenses' },
                    { value: group.members?.length ?? 0, label: 'Members' },
                    { value: settlements.length, label: 'Settlements' },
                ].map(stat => (
                    <div key={stat.label} className="rounded-2xl border border-[#2a2d35] bg-[#16181c] px-5 py-4">
                        <div className="mb-0.5 font-serif text-2xl text-white">{stat.value}</div>
                        <div className="text-[11px] uppercase tracking-widest text-[#5c6070]">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="mb-7 flex gap-1 border-b border-[#2a2d35]">
                {['expenses', 'settlements'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm capitalize transition-all ${
                            activeTab === tab
                                ? 'border-emerald-400 text-white'
                                : 'border-transparent text-[#9a9da8] hover:text-white'
                        }`}>
                        {tab}
                        {tab === 'settlements' && settlements.length > 0 && (
                            <span className="rounded-full bg-emerald-400 px-1.5 py-0.5 text-[11px] font-bold text-[#0a1a13]">
                                {settlements.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Expenses tab */}
            {activeTab === 'expenses' && (
                <div className="fade-up">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex gap-1.5">
                                {[0,1,2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse"
                                        style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="flex flex-col items-center gap-4 py-16 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                                <span className="font-serif text-2xl text-white/20">÷</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/50 mb-1">No expenses yet</p>
                                <p className="text-xs text-white/25">Add the first one to start tracking</p>
                            </div>
                            <button onClick={() => setShowModal(true)}
                                className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#0a1a13] transition-all hover:bg-emerald-300">
                                Add first expense
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {expenses.map((expense, index) => (
                                <div key={expense.id}
                                    className="group fade-up flex items-center gap-4 rounded-2xl border border-[#2a2d35] bg-[#16181c] px-5 py-4 transition-all hover:border-[#363a45]"
                                    style={{ animationDelay: `${index * 0.04}s` }}>
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e2026] text-base">
                                        {categoryIcon(expense.category)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-0.5 text-sm font-medium text-white">
                                            {expense.description}
                                        </p>
                                        <p className="text-xs text-[#5c6070]">
                                            Paid by{' '}
                                            <span className="text-[#9a9da8]">{expense.paidBy?.name}</span>
                                            {expense.date && ` · ${expense.date}`}
                                            {expense.category && ` · ${expense.category}`}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="font-serif text-lg text-white">
                                            ₹{parseFloat(expense.amount).toFixed(2)}
                                        </div>
                                        <div className="text-[11px] text-[#5c6070]">
                                            ₹{(parseFloat(expense.amount) / (expense.splits?.length || 1)).toFixed(2)} each
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(expense.id)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-[#5c6070] opacity-0 transition-all hover:bg-red-400/10 hover:text-red-400 group-hover:opacity-100">
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Settlements tab */}
            {activeTab === 'settlements' && (
                <div className="fade-up">
                    {settleLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex gap-1.5">
                                {[0,1,2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse"
                                        style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                    ) : settlements.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 text-xl">
                                ✓
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/50 mb-1">All settled up!</p>
                                <p className="text-xs text-white/25">No outstanding balances</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="mb-4 text-xs uppercase tracking-widest text-[#5c6070]">
                                Minimum transactions to settle all debts
                            </p>
                            <div className="flex flex-col gap-2.5">
                                {settlements.map((settlement, index) => (
                                    <div key={index}
                                        className="fade-up flex items-center gap-5 rounded-2xl border border-[#2a2d35] bg-[#16181c] px-6 py-5"
                                        style={{ animationDelay: `${index * 0.06}s` }}>
                                        <div className="flex flex-1 items-center gap-2.5">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2d35] bg-[#1e2026] text-sm font-semibold text-[#9a9da8]">
                                                {settlement.payerName[0]}
                                            </div>
                                            <span className="text-sm font-medium text-white">
                                                {settlement.payerName}
                                            </span>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-center gap-0.5">
                                            <span className="font-serif text-lg text-amber-400">
                                                ₹{parseFloat(settlement.amount).toFixed(2)}
                                            </span>
                                            <span className="text-sm text-[#5c6070]">→</span>
                                        </div>
                                        <div className="flex flex-1 items-center justify-end gap-2.5">
                                            <span className="text-sm font-medium text-white">
                                                {settlement.payeeName}
                                            </span>
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-sm font-semibold text-emerald-400">
                                                {settlement.payeeName[0]}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Add expense modal */}
            {showModal && (
                <AddExpenseModal group={group} onClose={() => setShowModal(false)} onAdded={handleAddExpense} />
            )}

            {/* Leave modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
                    onClick={e => e.target === e.currentTarget && setShowLeaveModal(false)}>
                    <div className="w-full max-w-sm rounded-2xl border border-[#363a45] bg-[#16181c] p-7 shadow-2xl">
                        <div className="mb-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0 text-red-400 text-lg">
                                ⚠
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white mb-1">
                                    Leave "{group.name}"?
                                </h3>
                                <p className="text-sm text-[#9a9da8] leading-relaxed">
                                    You'll be removed from this group and lose access to all its expenses and settlements.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2.5 justify-end">
                            <button onClick={() => setShowLeaveModal(false)}
                                className="px-4 py-2 text-sm text-[#9a9da8] border border-[#2a2d35] rounded-lg hover:text-white hover:bg-[#1e2026] transition-all">
                                Cancel
                            </button>
                            <button onClick={handleLeaveConfirm} disabled={leaveLoading}
                                className="px-4 py-2 text-sm font-medium bg-red-400/15 hover:bg-red-400/25 text-red-400 border border-red-400/25 hover:border-red-400/40 rounded-lg transition-all disabled:opacity-40">
                                {leaveLoading ? 'Leaving...' : 'Leave group'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
                    onClick={e => e.target === e.currentTarget && setShowDeleteModal(false)}>
                    <div className="w-full max-w-sm rounded-2xl border border-[#363a45] bg-[#16181c] p-7 shadow-2xl">
                        <div className="mb-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0 text-red-400 text-lg">
                                ⚠
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-white mb-1">
                                    Delete "{group.name}"?
                                </h3>
                                <p className="text-sm text-[#9a9da8] leading-relaxed">
                                    This will permanently delete the group and all its expenses and settlements. This cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2.5 justify-end">
                            <button onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm text-[#9a9da8] border border-[#2a2d35] rounded-lg hover:text-white hover:bg-[#1e2026] transition-all">
                                Cancel
                            </button>
                            <button onClick={handleDeleteConfirm} disabled={deleteLoading}
                                className="px-4 py-2 text-sm font-medium bg-red-400/15 hover:bg-red-400/25 text-red-400 border border-red-400/25 hover:border-red-400/40 rounded-lg transition-all disabled:opacity-40">
                                {deleteLoading ? 'Deleting...' : 'Delete group'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}