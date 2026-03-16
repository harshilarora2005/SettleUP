import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGroups } from '../store/groupSlice'
import { fetchAllExpenses } from '../store/expenseSlice'
import { useAuth } from '../context/AuthContext'

const categoryIcon = { Food: '🍴', Travel: '✈️', Stay: '🏠', Activities: '⚡', Other: '•' }
const categoryColor = {
    Food: 'bg-orange-400/10 border-orange-400/20 text-orange-400',
    Travel: 'bg-blue-400/10 border-blue-400/20 text-blue-400',
    Stay: 'bg-purple-400/10 border-purple-400/20 text-purple-400',
    Activities: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
    Other: 'bg-white/5 border-white/10 text-white/40',
}

export default function Dashboard() {
    const dispatch = useDispatch()
    const { user } = useAuth()
    const { list: groups } = useSelector(s => s.groups)
    const { allExpenses: expenses, allLoading } = useSelector(s => s.expenses)

    useEffect(() => {
        dispatch(fetchGroups())
        dispatch(fetchAllExpenses())
    }, [dispatch])

    const totalSpend = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
    const avgPerExpense = expenses.length ? totalSpend / expenses.length : 0

    const myShare = expenses.reduce((sum, e) => {
        const split = e.splits?.find(s => s.user?.name === user?.name)
        return sum + parseFloat(split?.shareAmount || 0)
    }, 0)

    const byCategory = expenses.reduce((acc, e) => {
        const cat = e.category || 'Other'
        acc[cat] = (acc[cat] || 0) + parseFloat(e.amount || 0)
        return acc
    }, {})
    const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
    const maxCatAmount = categoryEntries[0]?.[1] || 1
    const recentExpenses = expenses.slice(0, 5)

    const fmt = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 })

    const StatCard = ({ value, label, sub, accent }) => (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4">
            <p className={`font-serif text-2xl font-normal mb-0.5 ${accent || 'text-white'}`}>{value}</p>
            <p className="text-[11px] uppercase tracking-widest text-white/30">{label}</p>
            {sub && <p className="text-xs text-white/20 mt-1">{sub}</p>}
        </div>
    )

    if (allLoading) return (
        <div className="flex items-center justify-center py-32">
            <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
            </div>
        </div>
    )

    return (
        <div className="w-full px-8 lg:px-12 py-10">
            <div className="mb-10">
                <p className="text-xs font-medium text-white/25 uppercase tracking-widest mb-3">Overview</p>
                <h1 className="font-serif text-2xl sm:text-3xl text-white font-normal leading-snug">
                    Good to see you, <em className="not-italic text-emerald-400">{user?.name}</em>
                </h1>
                <p className="text-[13px] text-white/30 mt-1.5">Here's a summary across all your groups</p>
            </div>

            <div className="border-t border-white/[0.05] mb-8" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <StatCard value={`₹${fmt(totalSpend)}`} label="Total spent" sub={`across ${groups.length} group${groups.length !== 1 ? 's' : ''}`} />
                <StatCard value={`₹${fmt(myShare)}`} label="Your share" accent="text-emerald-400" />
                <StatCard value={expenses.length} label="Expenses" sub={avgPerExpense > 0 ? `avg ₹${avgPerExpense.toFixed(0)} each` : null} />
                <StatCard value={groups.length} label="Groups" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Category breakdown */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
                    <p className="text-xs font-medium text-white/25 uppercase tracking-widest mb-5">Spend by category</p>
                    {categoryEntries.length === 0 ? (
                        <p className="text-sm text-white/20 py-8 text-center">No expenses yet</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {categoryEntries.map(([cat, amount]) => (
                                <div key={cat} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm shrink-0 ${categoryColor[cat] || categoryColor.Other}`}>
                                        {categoryIcon[cat] || '•'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-medium text-white/60">{cat}</span>
                                            <span className="text-xs text-white/40">₹{fmt(amount)}</span>
                                        </div>
                                        <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                                            <div className="h-full rounded-full bg-emerald-400/50 transition-all duration-700"
                                                style={{ width: `${(amount / maxCatAmount) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent expenses */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
                    <div className="flex items-center justify-between mb-5">
                        <p className="text-xs font-medium text-white/25 uppercase tracking-widest">Recent expenses</p>
                        <Link to="/groups" className="text-xs text-emerald-400/60 hover:text-emerald-400 transition-colors">View all →</Link>
                    </div>
                    {recentExpenses.length === 0 ? (
                        <p className="text-sm text-white/20 py-8 text-center">No expenses yet</p>
                    ) : (
                        <div className="flex flex-col">
                            {recentExpenses.map(expense => (
                                <div key={expense.id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs shrink-0 ${categoryColor[expense.category] || categoryColor.Other}`}>
                                        {categoryIcon[expense.category] || '•'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{expense.description}</p>
                                        <p className="text-xs text-white/30">
                                            {expense.paidBy?.name}{expense.date && ` · ${expense.date}`}
                                        </p>
                                    </div>
                                    <span className="text-sm font-medium text-white/60 shrink-0">
                                        ₹{parseFloat(expense.amount).toFixed(0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Groups quick access */}
            {groups.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-medium text-white/25 uppercase tracking-widest">Your groups</p>
                        <Link to="/groups" className="text-xs text-emerald-400/60 hover:text-emerald-400 transition-colors">Manage →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                        {groups.slice(0, 4).map(group => (
                            <Link key={group.id} to={`/groups/${group.id}`}
                                className="group flex items-center gap-3 p-3.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/[0.10] rounded-xl transition-all duration-150">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-serif text-base text-emerald-400 shrink-0">
                                    {group.name[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-white truncate">{group.name}</p>
                                    <p className="text-xs text-white/30">{group.members?.length ?? 0} members</p>
                                </div>
                                <span className="text-white/20 group-hover:text-white/50 text-sm transition-colors">→</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}