import { useState, useEffect } from "react"
import { Theme } from "../types"

/**
 * Hook to manage theme state and persistence
 */
export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        // First check if there's a saved theme preference
        const savedTheme = localStorage.getItem('aiTextGenTheme')
        if (savedTheme === 'dark' || savedTheme === 'light') {
            return savedTheme
        }
        
        // Then check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    })
    
    // Save theme preference whenever it changes
    useEffect(() => {
        localStorage.setItem('aiTextGenTheme', theme)
        
        // Apply theme class to body and main
        document.body.classList.remove('theme-light', 'theme-dark')
        document.body.classList.add(`theme-${theme}`)
        
        const mainElement = document.querySelector('main')
        if (mainElement) {
            mainElement.classList.remove('theme-light', 'theme-dark')
            mainElement.classList.add(`theme-${theme}`)
        }
    }, [theme])
    
    // Add listener for theme changes from system if user hasn't set a preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
            // Only update if the user hasn't explicitly set a preference
            const savedTheme = localStorage.getItem('aiTextGenTheme')
            if (!savedTheme) {
                setTheme(e.matches ? 'dark' : 'light')
            }
        }
        
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])
    
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }
    
    return { theme, toggleTheme }
} 