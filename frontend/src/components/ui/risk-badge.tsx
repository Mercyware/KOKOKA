import React from 'react';
import { Badge } from './badge';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showIcon?: boolean;
  className?: string;
}

const riskConfig = {
  CRITICAL: {
    variant: 'destructive' as const,
    icon: AlertCircle,
    bgClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    label: 'Critical Risk',
  },
  HIGH: {
    variant: 'destructive' as const,
    icon: AlertTriangle,
    bgClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    label: 'High Risk',
  },
  MODERATE: {
    variant: 'default' as const,
    icon: Info,
    bgClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    label: 'Moderate Risk',
  },
  LOW: {
    variant: 'secondary' as const,
    icon: CheckCircle,
    bgClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    label: 'Low Risk',
  },
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showIcon = true,
  className = '',
}) => {
  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <Badge className={`${config.bgClass} ${className}`}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
      {score !== undefined && ` (${score.toFixed(1)})`}
    </Badge>
  );
};

export default RiskBadge;
