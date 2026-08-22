import React, { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import '../styles/bottom-nav.css'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    let mounted = true

    api.get('/api/auth/me')
      .then((response) => {
        if (mounted) {
          setSession(response.data)
          setSessionChecked(true)
        }
      })
      .catch(() => {
        if (mounted) {
          setSession(null)
          setSessionChecked(true)
        }
      })

    return () => { mounted = false }
  }, [location.pathname])

  async function logout() {
    try {
      await api.get(session?.type === 'food-partner'
        ? '/api/auth/food-partner/logout'
        : '/api/auth/user/logout')
    } finally {
      setSession(null)
      navigate('/user/login')
    }
  }

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom">
      <div className="bottom-nav__inner">
        <NavLink to="/" end className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
          <span className="bottom-nav__icon" aria-hidden="true">
            {/* home icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5"/>
              <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/>
            </svg>
          </span>
          <span className="bottom-nav__label">Home</span>
        </NavLink>

        <NavLink to="/saved" className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
          <span className="bottom-nav__icon" aria-hidden="true">
            {/* bookmark icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>
            </svg>
          </span>
          <span className="bottom-nav__label">Saved</span>
        </NavLink>

        {sessionChecked && session ? (
          <button type="button" className="bottom-nav__item bottom-nav__button" onClick={logout}>
            <span className="bottom-nav__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M21 3v18" />
              </svg>
            </span>
            <span className="bottom-nav__label">Logout</span>
          </button>
        ) : sessionChecked ? (
          <NavLink to="/user/login" className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}>
            <span className="bottom-nav__icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 17l5-5-5-5" />
                <path d="M20 12H8" />
                <path d="M4 4v16" />
              </svg>
            </span>
            <span className="bottom-nav__label">Login</span>
          </NavLink>
        ) : null}
      </div>
    </nav>
  )
}

export default BottomNav