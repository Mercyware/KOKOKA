
import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex items-center bg-blue-800 dark:bg-blue-900 rounded-lg p-1">
      {themes.map(({ name, icon: Icon, label }) => (
        <button
          key={name}
          onClick={() => setTheme(name as 'light' | 'dark' | 'system')}
          className={cn(
            "flex items-center justify-center px-2 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex-1",
            theme === name
              ? "bg-blue-600 dark:bg-blue-700 text-white shadow-sm"
              : "text-blue-200 dark:text-blue-300 hover:text-white hover:bg-blue-700 dark:hover:bg-blue-800"
          )}
          title={`Switch to ${label} mode`}
        >
          <Icon className="h-4 w-4" />
          <span className="ml-1 text-xs hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
