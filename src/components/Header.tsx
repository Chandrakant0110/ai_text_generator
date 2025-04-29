import React from 'react'
import { Theme } from '../types'

interface HeaderProps {
    theme: Theme
    toggleTheme: () => void
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
    return (
        <div className="header">
            <h2>AI Text Generator</h2>
            <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
        </div>
    )
} 