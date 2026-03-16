import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const { login, loading, error, token } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (token) navigate('/dashboard')
    }, [token])

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    async function handleSubmit(e) {
        e.preventDefault()
        const result = await login(form)
        if (!result.error) navigate('/dashboard')
    }

    // Map backend errors to friendly messages
    const friendlyError = error
        ? error.toLowerCase().includes('bad credentials') || error.toLowerCase().includes('unauthorized') || error.toLowerCase().includes('invalid')
            ? 'Incorrect email or password. Please try again.'
            : error.toLowerCase().includes('not found')
                ? 'No account found with this email.'
                : error
        : null

    const inputClass = "w-full bg-[#1e2026] border border-[#2a2d35] text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors placeholder:text-[#5c6070]"

    return (
        <div className="min-h-screen bg-[#0e0f11] flex items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-2.5 mb-10">
                    <span className="font-serif text-3xl text-emerald-400">÷</span>
                    <span className="font-serif text-xl text-white">splitwise</span>
                </div>

                <h1 className="font-serif text-3xl text-white font-normal mb-1.5">Welcome back</h1>
                <p className="text-sm text-[#9a9da8] mb-8">Sign in to your account</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[#9a9da8] uppercase tracking-wider">Email</label>
                        <input name="email" type="email" placeholder="you@example.com"
                            value={form.email} onChange={handleChange} className={inputClass} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-[#9a9da8] uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input name="password" type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••" value={form.password} onChange={handleChange}
                                className={`${inputClass} pr-11`} />
                            <button type="button" onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c6070] hover:text-[#9a9da8] transition-colors p-0.5">
                                {showPassword ? (
                                    // Eye-off icon
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    // Eye icon
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {friendlyError && (
                        <div className="flex items-start gap-2.5 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3.5 py-2.5">
                            <span className="mt-0.5 shrink-0">✕</span>
                            <span>{friendlyError}</span>
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full h-11 mt-1 bg-emerald-400 hover:bg-emerald-300 text-[#0a1a13] font-semibold rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-7 text-sm text-[#9a9da8] text-center">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-emerald-400 font-medium hover:underline">Create one</Link>
                </p>
            </div>
        </div>
    )
}