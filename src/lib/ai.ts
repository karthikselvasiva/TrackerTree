import { CATEGORY_KEYWORDS } from './constants';
import type { Transaction, Category, MonthlySummary } from '@/types';
import { formatCurrency } from './utils';

/**
 * Rule-based auto-categorization using keyword matching.
 * Returns the best matching category name or null.
 */
export function autoCategorizeTxn(description: string): string | null {
  const text = description.toLowerCase().trim();
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        const score = keyword.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = category;
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Find category ID from name
 */
export function findCategoryByName(name: string, categories: Category[]): Category | undefined {
  return categories.find(c => c.name.toLowerCase() === name.toLowerCase());
}

/**
 * Generate AI-like insights from transaction data
 */
export function generateInsights(
  transactions: Transaction[],
  categories: Category[]
): string[] {
  const insights: string[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Filter this month and last month transactions
  const thisMonthTxns = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const lastMonthTxns = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const thisMonthExpense = thisMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const lastMonthExpense = lastMonthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const thisMonthIncome = thisMonthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  // 1. Spending trend
  if (lastMonthExpense > 0 && thisMonthExpense > 0) {
    const change = ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
    if (change > 10) {
      insights.push(`📈 Your spending is up ${Math.round(change)}% compared to last month. Consider reviewing your expenses.`);
    } else if (change < -10) {
      insights.push(`📉 Great job! You've reduced spending by ${Math.round(Math.abs(change))}% compared to last month.`);
    } else {
      insights.push(`📊 Your spending is stable compared to last month. Keep it consistent!`);
    }
  }

  // 2. Category-wise analysis
  const categorySpending: Record<string, { current: number; previous: number }> = {};
  thisMonthTxns.filter(t => t.type === 'expense').forEach(t => {
    const cat = categories.find(c => c.id === t.category_id);
    if (cat) {
      if (!categorySpending[cat.name]) categorySpending[cat.name] = { current: 0, previous: 0 };
      categorySpending[cat.name].current += t.amount;
    }
  });
  lastMonthTxns.filter(t => t.type === 'expense').forEach(t => {
    const cat = categories.find(c => c.id === t.category_id);
    if (cat) {
      if (!categorySpending[cat.name]) categorySpending[cat.name] = { current: 0, previous: 0 };
      categorySpending[cat.name].previous += t.amount;
    }
  });

  // Find biggest increase
  let biggestIncrease = { category: '', percent: 0 };
  for (const [cat, spending] of Object.entries(categorySpending)) {
    if (spending.previous > 0) {
      const pct = ((spending.current - spending.previous) / spending.previous) * 100;
      if (pct > biggestIncrease.percent) {
        biggestIncrease = { category: cat, percent: pct };
      }
    }
  }
  if (biggestIncrease.percent > 20) {
    insights.push(`🍔 You're spending ${Math.round(biggestIncrease.percent)}% more on ${biggestIncrease.category} this month.`);
  }

  // 3. Top spending category
  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1].current - a[1].current)[0];
  if (topCategory && topCategory[1].current > 0) {
    const pctOfTotal = thisMonthExpense > 0 ? Math.round((topCategory[1].current / thisMonthExpense) * 100) : 0;
    insights.push(`💰 ${topCategory[0]} is your top expense this month (${pctOfTotal}% of total — ${formatCurrency(topCategory[1].current)}).`);
  }

  // 4. Savings rate
  if (thisMonthIncome > 0) {
    const savings = thisMonthIncome - thisMonthExpense;
    const savingsRate = Math.round((savings / thisMonthIncome) * 100);
    if (savingsRate > 30) {
      insights.push(`🎯 Excellent! You're saving ${savingsRate}% of your income this month.`);
    } else if (savingsRate > 10) {
      insights.push(`💡 You're saving ${savingsRate}% of your income. Try to push it above 30%.`);
    } else if (savingsRate >= 0) {
      insights.push(`⚠️ Your savings rate is only ${savingsRate}%. Consider cutting non-essential expenses.`);
    } else {
      insights.push(`🚨 You're overspending by ${formatCurrency(Math.abs(savings))} this month. Review your budget immediately.`);
    }
  }

  // 5. Prediction
  if (thisMonthTxns.length > 5) {
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const projectedExpense = Math.round((thisMonthExpense / dayOfMonth) * daysInMonth);
    insights.push(`🔮 Projected month-end expense: ${formatCurrency(projectedExpense)} based on your current pace.`);
  }

  // Fallback
  if (insights.length === 0) {
    insights.push('📊 Start adding transactions to get personalized insights!');
    insights.push('💡 Categorize your expenses to see spending patterns.');
  }

  return insights.slice(0, 5);
}

/**
 * Generate monthly summary data
 */
export function generateMonthlySummary(transactions: Transaction[]): MonthlySummary[] {
  const monthMap: Record<string, { income: number; expense: number }> = {};

  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
    if (t.type === 'income') monthMap[key].income += t.amount;
    else monthMap[key].expense += t.amount;
  });

  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }));
}
