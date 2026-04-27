import { useDispatch, useSelector } from 'react-redux'
import { AuthContext } from './AuthContext'
import { loginThunk, registerThunk, logout } from '../store/authSlice'

export function AuthProvider({ children }) {
    const dispatch = useDispatch()
    const { user, token, loading, error } = useSelector((state) => state.auth)

    async function handleLogin(creds) {
        const result = await dispatch(loginThunk(creds))
        if (loginThunk.fulfilled.match(result)) {
            return { error: null }
        } else {
            return { error: result.payload || 'Login failed' }
        }
    }

    async function handleRegister(data) {
        const result = await dispatch(registerThunk(data))
        if (registerThunk.fulfilled.match(result)) {
            return { error: null }
        } else {
            return { error: result.payload || 'Registration failed' }
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                error,
                login: handleLogin,
                register: handleRegister,
                logout: () => dispatch(logout()),
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}