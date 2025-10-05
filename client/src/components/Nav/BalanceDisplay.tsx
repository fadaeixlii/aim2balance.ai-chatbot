import { memo } from 'react';
import type { TBalanceResponse } from 'librechat-data-provider';

interface BalanceDisplayProps {
  balance: TBalanceResponse;
  className?: string;
}

/**
 * BalanceDisplay Component
 * Displays user balance in both EUR (primary) and USD (secondary)
 * EUR is the primary currency for aim2balance.ai billing
 * USD is shown for transparency and comparison
 */
function BalanceDisplay({ balance, className = '' }: BalanceDisplayProps) {
  const { balanceEUR, balanceUSD } = balance;

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="text-sm font-medium text-text-primary">
        €{balanceEUR.toFixed(2)} <span className="text-xs text-text-secondary">EUR</span>
      </div>
      <div className="text-xs text-text-secondary">
        ${balanceUSD.toFixed(2)} <span className="text-xs">USD</span>
      </div>
    </div>
  );
}

export default memo(BalanceDisplay);
