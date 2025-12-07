import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/components/ui';
import { SUPPORTED_CURRENCIES, Currency } from '@/lib/currency';

interface CurrencySelectorProps {
  value: string;
  onValueChange: (code: string) => void;
  label?: string;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onValueChange,
  label = 'Currency',
  className,
}) => {
  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              {currency.symbol} {currency.name} ({currency.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
