'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'auto';
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  actualTheme: 'light' | 'dark';
}

const defaultThemeContext: ThemeContextType = {
  theme: 'light',
  setTheme: () => {},
  actualTheme: 'light',
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'auto'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark' | 'auto') || 'dark';
    }
    return 'dark';
  });

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
      return getActualTheme(savedTheme || 'dark');
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const applyThemeToDOM = (currentTheme: 'light' | 'dark' | 'auto') => {
      const actual = getActualTheme(currentTheme);
      setActualTheme(actual);
      
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
    };
    
    applyThemeToDOM(theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const actual = mediaQuery.matches ? 'dark' : 'light';
        setActualTheme(actual);
        
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
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (typeof window !== 'undefined') {
      const actual = getActualTheme(newTheme);
      setActualTheme(actual);
      
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
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
