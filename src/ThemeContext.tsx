import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeMode;
    actualTheme: 'light' | 'dark';
    setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<ThemeMode>(() => {
        const savedTheme = localStorage.getItem('theme') as ThemeMode;
        return savedTheme || 'system';
    });

    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const root = window.document.documentElement;

        const updateActualTheme = () => {
            let newActualTheme: 'light' | 'dark' = 'light';

            if (theme === 'system') {
                newActualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else {
                newActualTheme = theme;
            }

            setActualTheme(newActualTheme);

            // Update document class for CSS
            root.classList.remove('light', 'dark');
            root.classList.add(newActualTheme);

            // Update document attribute for antd
            root.setAttribute('data-theme', newActualTheme);
        };

        updateActualTheme();

        // Listen for system theme changes
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', updateActualTheme);
            return () => mediaQuery.removeEventListener('change', updateActualTheme);
        }
    }, [theme]);

    const handleSetTheme = (newTheme: ThemeMode) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, actualTheme, setTheme: handleSetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}; 