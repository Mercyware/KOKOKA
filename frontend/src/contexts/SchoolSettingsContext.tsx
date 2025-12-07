import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DEFAULT_CURRENCY, Currency, getCurrency } from '@/lib/currency';
import { getSchoolSettings as fetchSchoolSettings } from '@/services/schoolSettingsService';

interface SchoolSettings {
  currency: Currency;
  academicYearStart: string;
  // Add more settings as needed
}

interface SchoolSettingsContextType {
  settings: SchoolSettings;
  updateCurrency: (currencyCode: string) => void;
  isLoading: boolean;
}

const defaultSettings: SchoolSettings = {
  currency: DEFAULT_CURRENCY,
  academicYearStart: 'September',
};

const SchoolSettingsContext = createContext<SchoolSettingsContextType>({
  settings: defaultSettings,
  updateCurrency: () => {},
  isLoading: true,
});

export const useSchoolSettings = () => {
  const context = useContext(SchoolSettingsContext);
  if (!context) {
    throw new Error('useSchoolSettings must be used within SchoolSettingsProvider');
  }
  return context;
};

interface SchoolSettingsProviderProps {
  children: ReactNode;
}

export const SchoolSettingsProvider: React.FC<SchoolSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load school settings from API
    const loadSettings = async () => {
      try {
        const schoolSettings = await fetchSchoolSettings();
        const currencyCode = schoolSettings.settings?.currency || 'USD';

        setSettings({
          currency: getCurrency(currencyCode),
          academicYearStart: schoolSettings.settings?.academicYearStart || 'September',
        });
      } catch (error) {
        console.error('Error loading school settings:', error);
        // Fallback to localStorage
        try {
          const savedSettings = localStorage.getItem('schoolSettings');
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            if (parsed.currencyCode) {
              setSettings(prev => ({
                ...prev,
                currency: getCurrency(parsed.currencyCode),
              }));
            }
          }
        } catch (localStorageError) {
          console.error('Error loading from localStorage:', localStorageError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateCurrency = (currencyCode: string) => {
    const currency = getCurrency(currencyCode);
    setSettings(prev => ({ ...prev, currency }));

    // Save to localStorage as backup
    try {
      const currentSettings = JSON.parse(localStorage.getItem('schoolSettings') || '{}');
      localStorage.setItem('schoolSettings', JSON.stringify({
        ...currentSettings,
        currencyCode,
      }));
    } catch (error) {
      console.error('Error saving currency setting:', error);
    }
  };

  return (
    <SchoolSettingsContext.Provider value={{ settings, updateCurrency, isLoading }}>
      {children}
    </SchoolSettingsContext.Provider>
  );
};
