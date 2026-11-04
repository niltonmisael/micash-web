/** micash-api JSON contracts used by the web (camelCase, as the API serializes them). */

export type UserProfile = { name: string; email: string; emailVerified: boolean };

export type CodeSent = {
  email: string;
  resendAvailableInSeconds: number;
  codeExpiresInMinutes: number;
  codeLength: number;
};

export type ForgotPasswordSent = Omit<CodeSent, "email">;

export type PasswordResetCodeVerified = { resetToken: string; expiresInMinutes: number };

export type MonthlySummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  year: number;
  month: number;
};

export type DailySummary = {
  year: number;
  month: number;
  days: {
    day: number;
    income: number;
    expense: number;
    cumulativeIncome: number;
    cumulativeExpense: number;
  }[];
};

export type ExpenseCategorySummary = {
  categoryId: number;
  categoryName: string;
  amount: number;
  categoryColor: string;
  percentage: number;
};

export type LatestExpense = {
  id: number;
  title: string;
  category: string;
  color: string;
  amount: number;
  expenseDate: string;
};

export type SavingsGoal = {
  id: number;
  name: string;
  icon: string;
  color: string;
  targetAmount: number;
  savedAmount: number;
  percentage: number;
  deadline: string | null;
  isCompleted: boolean;
};

export type FinancialInsight = {
  type: number;
  typeDescription: string;
  title: string;
  message: string;
  isAI: boolean;
};

export type FinancialInsights = {
  insights: FinancialInsight[];
  artificialInsight: { title: string; message: string } | null;
  isPreview: boolean;
  lockedInsightsCount: number;
};

export type CurrentSubscription = {
  planId: number | null;
  planName: string;
  status: number;
  statusDescription: string;
  isPremium: boolean;
  nextBillingDate: string | null;
  accessEndsAt: string | null;
  paymentGraceUntil: string | null;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
};

export type PlanLimits = {
  plan: string;
  isPremium: boolean;
  maxFinancialGoalsPerMonth: number | null;
  maxSavingsGoals: number | null;
  /** Previous months visible besides the current one; null = unlimited. */
  historyMonths: number | null;
  fullInsights: boolean;
  monthForecast: boolean;
  chat: {
    period: string;
    limit: number;
    used: number;
    remaining: number;
    resetsAt: string;
    perMinute: number | null;
  };
};
