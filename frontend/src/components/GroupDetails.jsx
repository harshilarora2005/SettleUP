import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { fetchGroupById , leaveGroup} from '../store/groupSlice'
import {
    fetchExpenses,
    addExpense,
    deleteExpense,
    fetchSettlementPlan,
    clearExpenses,
    } from '../store/expenseSlice'

import AddExpenseModal from '../components/AddExpenseModal'

const categoryIcon = (category) =>
    ({
        Food: '🍴',
        Travel: '✈️',
        Stay: '🏠',
        Activities: '⚡',
        Other: '•',
    }[category] || '•')

    export default function GroupDetails() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [showModal, setShowModal] = useState(false)
    const [activeTab, setActiveTab] = useState('expenses')

    const { current: group, currentLoading } = useSelector((state) => state.groups)

    const {
        list: expenses,
        settlements,
        loading,
        settleLoading,
    } = useSelector((state) => state.expenses) 
    useEffect(() => {
        dispatch(fetchGroupById(id))
        dispatch(fetchExpenses(id))
        dispatch(fetchSettlementPlan(id))

        return () => {
        dispatch(clearExpenses())
        }
    }, [id, dispatch])

    async function handleAddExpense(data) {
        await dispatch(
        addExpense({
            ...data,
            groupId: Number(id),
        })
        )

        dispatch(fetchSettlementPlan(id))
        setShowModal(false)
    }

    async function handleLeaveGroup() {
        if (!confirm(`Leave "${group.name}"? You'll lose access to its expenses.`)) 
            return
        await dispatch(leaveGroup(Number(id)))
        navigate('/groups')
    }
    async function handleDelete(expenseId) {
        if (!confirm('Delete this expense?')) return

        await dispatch(deleteExpense(expenseId))
        dispatch(fetchSettlementPlan(id))
    }

    if (currentLoading) {
        return (
        <div className="py-32 text-center text-sm text-[#5c6070]">
            Loading group...
        </div>
        )
    }

    if (!group) {
        return (
        <div className="py-32 text-center text-sm text-[#5c6070]">
            Group not found.
        </div>
        )
    }

    const totalSpend = expenses.reduce(
        (sum, expense) => sum + parseFloat(expense.amount || 0),
        0
    )

    return (
        <div className="mx-auto max-w-3xl px-6 py-10 pb-20">
        <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 flex items-center gap-1.5 text-sm text-[#9a9da8] transition-colors hover:text-white"
        >
            ← Back
        </button>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 font-serif text-2xl text-emerald-400">
                    {group.name[0].toUpperCase()}
                </div>
                <div>
                    <h1 className="mb-2 font-serif text-3xl font-normal text-white">{group.name}</h1>
                    <div className="flex flex-wrap gap-1.5">
                        {group.members?.map(member => (
                            <span key={member.id} className="rounded-full border border-[#2a2d35] bg-[#1e2026] px-2.5 py-1 text-xs text-[#9a9da8]">
                                {member.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={handleLeaveGroup}
                    className="rounded-lg border border-red-400/20 px-4 py-2 text-sm font-medium text-red-400/60 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/30 transition-all"
                >
                    Leave group
                </button>
                <button
                    onClick={() => setShowModal(true)}
                    className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#0a1a13] transition-all hover:bg-emerald-300"
                >
                    + Add expense
                </button>
            </div>
        </div>
        <div className="mb-8 grid grid-cols-4 gap-3">
            {[
            { value: `₹${totalSpend.toFixed(0)}`, label: 'Total spent' },
            { value: expenses.length, label: 'Expenses' },
            { value: group.members?.length ?? 0, label: 'Members' },
            { value: settlements.length, label: 'Settlements' },
            ].map((stat) => (
            <div
                key={stat.label}
                className="rounded-2xl border border-[#2a2d35] bg-[#16181c] px-5 py-4"
            >
                <div className="mb-0.5 font-serif text-2xl text-white">
                {stat.value}
                </div>

                <div className="text-[11px] uppercase tracking-widest text-[#5c6070]">
                {stat.label}
                </div>
            </div>
            ))}
        </div>

        <div className="mb-7 flex gap-1 border-b border-[#2a2d35]">
            {['expenses', 'settlements'].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm capitalize transition-all ${
                activeTab === tab
                    ? 'border-emerald-400 text-white'
                    : 'border-transparent text-[#9a9da8] hover:text-white'
                }`}
            >
                {tab}

                {tab === 'settlements' && settlements.length > 0 && (
                <span className="rounded-full bg-emerald-400 px-1.5 py-0.5 text-[11px] font-bold text-[#0a1a13]">
                    {settlements.length}
                </span>
                )}
            </button>
            ))}
        </div>

        {activeTab === 'expenses' && (
            <div className="fade-up">
            {loading ? (
                <div className="py-16 text-center text-sm text-[#5c6070]">
                Loading expenses...
                </div>
            ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                <p className="text-sm text-[#9a9da8]">No expenses yet.</p>

                <button
                    onClick={() => setShowModal(true)}
                    className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-[#0a1a13] transition-all hover:bg-emerald-300"
                >
                    Add first expense
                </button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                {expenses.map((expense, index) => (
                    <div
                    key={expense.id}
                    className="group fade-up flex items-center gap-4 rounded-2xl border border-[#2a2d35] bg-[#16181c] px-5 py-4 transition-all hover:border-[#363a45]"
                    style={{ animationDelay: `${index * 0.04}s` }}
                    >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e2026] text-base">
                        {categoryIcon(expense.category)}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="mb-0.5 text-sm font-medium text-white">
                        {expense.description}
                        </p>

                        <p className="text-xs text-[#5c6070]">
                        Paid by{' '}
                        <span className="text-[#9a9da8]">
                            {expense.paidBy?.name}
                        </span>
                        {expense.date && ` · ${expense.date}`}
                        {expense.category && ` · ${expense.category}`}
                        </p>
                    </div>

                    <div className="shrink-0 text-right">
                        <div className="font-serif text-lg text-white">
                        ₹{parseFloat(expense.amount).toFixed(2)}
                        </div>

                        <div className="text-[11px] text-[#5c6070]">
                        ₹
                        {(
                            parseFloat(expense.amount) /
                            (expense.splits?.length || 1)
                        ).toFixed(2)}{' '}
                        each
                        </div>
                    </div>

                    <button
                        onClick={() => handleDelete(expense.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-[#5c6070] opacity-0 transition-all hover:bg-red-400/10 hover:text-red-400 group-hover:opacity-100"
                    >
                        ×
                    </button>
                    </div>
                ))}
                </div>
            )}
            </div>
        )}

        {activeTab === 'settlements' && (
            <div className="fade-up">
            {settleLoading ? (
                <div className="py-16 text-center text-sm text-[#5c6070]">
                Calculating...
                </div>
            ) : settlements.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="text-4xl text-emerald-400">✓</span>
                <p className="text-sm text-[#9a9da8]">All settled up!</p>
                </div>
            ) : (
                <>
                <p className="mb-4 text-xs uppercase tracking-widest text-[#5c6070]">
                    Minimum transactions to settle all debts
                </p>

                <div className="flex flex-col gap-2.5">
                    {settlements.map((settlement, index) => (
                    <div
                        key={index}
                        className="fade-up flex items-center gap-5 rounded-2xl border border-[#2a2d35] bg-[#16181c] px-6 py-5"
                        style={{ animationDelay: `${index * 0.06}s` }}
                    >
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

        {showModal && (
            <AddExpenseModal
            group={group}
            onClose={() => setShowModal(false)}
            onAdded={handleAddExpense}
            />
        )}
        </div>
    )
}