'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'ar';
  currency: string;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: 'en' | 'ar') => void;
  setCurrency: (currency: string) => void;
  isRTL: boolean;
  actualTheme: 'light' | 'dark';
}

// Provide default values to prevent undefined context errors
const defaultThemeContext: ThemeContextType = {
  theme: 'light',
  language: 'en',
  currency: 'USD',
  setTheme: () => {},
  setLanguage: () => {},
  setCurrency: () => {},
  isRTL: false,
  actualTheme: 'light',
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage immediately if available
  const [theme, setThemeState] = useState<'light' | 'dark' | 'auto'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark' | 'auto') || 'dark';
    }
    return 'dark'; // Default to dark
  });
  const [language, setLanguageState] = useState<'en' | 'ar'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as 'en' | 'ar') || 'en';
    }
    return 'en';
  });
  const [currency, setCurrencyState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('currency') || 'USD';
    }
    return 'USD';
  });
  const [loading, setLoading] = useState(true);

  // Calculate actual theme (handles 'auto' mode)
  const getActualTheme = (currentTheme: 'light' | 'dark' | 'auto'): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    if (currentTheme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return currentTheme;
  };

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
      return getActualTheme(savedTheme || 'dark'); // Default to dark theme
    }
    return 'dark'; // Default to dark theme
  });
  const isRTL = language === 'ar';

  // Apply initial theme immediately on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Apply theme immediately based on current state
    const root = document.documentElement;
    const body = document.body;
    const actual = getActualTheme(theme);
    
    // Remove all theme classes first
    root.classList.remove('dark');
    body.classList.remove('dark');
    
    // Apply the correct theme
    if (actual === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    
    setActualTheme(actual);
  }, []); // Run once on mount

  // Load settings from backend or localStorage
  useEffect(() => {
    const loadSettings = async () => {
      // First, load from localStorage immediately for instant UI update
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' | null;
      const savedLanguage = localStorage.getItem('language') as 'en' | 'ar' | null;
      const savedCurrency = localStorage.getItem('currency');
      
      if (savedTheme) {
        setThemeState(savedTheme);
        // Apply theme immediately
        const actual = getActualTheme(savedTheme);
        const root = document.documentElement;
        const body = document.body;
        root.classList.remove('dark');
        body.classList.remove('dark');
        if (actual === 'dark') {
          root.classList.add('dark');
          body.classList.add('dark');
          root.setAttribute('data-theme', 'dark');
        } else {
          root.setAttribute('data-theme', 'light');
        }
        setActualTheme(actual);
      }
      if (savedLanguage) setLanguageState(savedLanguage);
      if (savedCurrency) setCurrencyState(savedCurrency);
      
      // Then try to load from backend
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await api.get('/admin/settings');
          if (res.data) {
            if (res.data.theme) {
              setThemeState(res.data.theme);
              // Apply theme immediately
              const actual = getActualTheme(res.data.theme);
              const root = document.documentElement;
              const body = document.body;
              root.classList.remove('dark');
              body.classList.remove('dark');
              if (actual === 'dark') {
                root.classList.add('dark');
                body.classList.add('dark');
                root.setAttribute('data-theme', 'dark');
              } else {
                root.setAttribute('data-theme', 'light');
              }
              setActualTheme(actual);
            }
            if (res.data.language) setLanguageState(res.data.language);
            if (res.data.currency) setCurrencyState(res.data.currency);
          }
        }
      } catch (error) {
        // Backend unavailable, localStorage already loaded above
        console.log('Settings loaded from localStorage');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Apply theme to document - unified effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const applyThemeToDOM = (currentTheme: 'light' | 'dark' | 'auto') => {
      const actual = getActualTheme(currentTheme);
      setActualTheme(actual);
      
      const root = document.documentElement;
      const body = document.body;
      
      // Remove all theme classes first
      root.classList.remove('dark');
      body.classList.remove('dark');
      
      // Apply the correct theme
      if (actual === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.setAttribute('data-theme', 'light');
      }
    };
    
    // Apply theme immediately
    applyThemeToDOM(theme);
    localStorage.setItem('theme', theme);
    
    // If auto mode, listen for system preference changes
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const actual = mediaQuery.matches ? 'dark' : 'light';
        setActualTheme(actual);
        
        const root = document.documentElement;
        const body = document.body;
        
        // Remove all theme classes first
        root.classList.remove('dark');
        body.classList.remove('dark');
        
        // Apply the correct theme
        if (actual === 'dark') {
          root.classList.add('dark');
          body.classList.add('dark');
          root.setAttribute('data-theme', 'dark');
        } else {
          root.setAttribute('data-theme', 'light');
        }
      };
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Apply initial language/RTL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const applyInitialLanguage = () => {
      const html = document.documentElement;
      const isRTLNew = language === 'ar';
      html.setAttribute('lang', language);
      html.setAttribute('dir', isRTLNew ? 'rtl' : 'ltr');
      
      if (isRTLNew) {
        html.classList.add('rtl');
        document.body.classList.add('rtl');
      } else {
        html.classList.remove('rtl');
        document.body.classList.remove('rtl');
      }
    };
    
    applyInitialLanguage();
  }, []); // Run once on mount

  // Apply language/RTL to document when language changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const html = document.documentElement;
    html.setAttribute('lang', language);
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    
    if (isRTL) {
      html.classList.add('rtl');
      document.body.classList.add('rtl');
    } else {
      html.classList.remove('rtl');
      document.body.classList.remove('rtl');
    }
    
    localStorage.setItem('language', language);
  }, [language, isRTL]);

  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply immediately
    if (typeof window !== 'undefined') {
      const actual = getActualTheme(newTheme);
      setActualTheme(actual);
      
      const root = document.documentElement;
      const body = document.body;
      
      // Remove all theme classes first to avoid conflicts
      root.classList.remove('dark');
      body.classList.remove('dark');
      
      // Apply the correct theme
      if (actual === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.setAttribute('data-theme', 'light');
      }
      
      // Force a reflow to ensure styles apply
      void root.offsetHeight;
    }
    
    // Save to backend if admin
    const token = localStorage.getItem('token');
    if (token) {
      api.put('/admin/settings', { theme: newTheme, language, currency }).catch(() => {
        // Silently fail if not admin
      });
    }
  };

  const setLanguage = (newLanguage: 'en' | 'ar') => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Apply immediately
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      const isRTL = newLanguage === 'ar';
      html.setAttribute('lang', newLanguage);
      html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      
      if (isRTL) {
        html.classList.add('rtl');
        document.body.classList.add('rtl');
      } else {
        html.classList.remove('rtl');
        document.body.classList.remove('rtl');
      }
    }
    
    // Save to backend if admin
    const token = localStorage.getItem('token');
    if (token) {
      api.put('/admin/settings', { theme, language: newLanguage, currency }).catch(() => {
        // Silently fail if not admin
      });
    }
  };

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
    
    // Save to backend if admin
    const token = localStorage.getItem('token');
    if (token) {
      api.put('/admin/settings', { theme, language, currency: newCurrency }).catch(() => {
        // Silently fail if not admin
      });
    }
  };

  // Always provide context, even during loading
  return (
    <ThemeContext.Provider
      value={{
        theme,
        language,
        currency,
        setTheme,
        setLanguage,
        setCurrency,
        isRTL,
        actualTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // Context should never be undefined now since we provide default value
  return context;
}

