export const RELATIONSHIP_TYPES = [
  'father',
  'mother',
  'husband',
  'wife',
  'son',
  'daughter',
  'grandparents',
  'other',
  'self',
] as const;

export const INCOME_FREQUENCIES = [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
  'half_yearly',
  'yearly',
  'freelance',
  'seasonal',
  'one_time',
  'custom',
] as const;

export const DEFAULT_INCOME_SOURCES = [
  { name: 'Salary', slug: 'salary', icon: '💼' },
  { name: 'Business', slug: 'business', icon: '🏢' },
  { name: 'Freelancing', slug: 'freelancing', icon: '💻' },
  { name: 'Rental Income', slug: 'rental-income', icon: '🏠' },
  { name: 'Investments', slug: 'investments', icon: '📈' },
  { name: 'Pension', slug: 'pension', icon: '🏦' },
  { name: 'Agriculture', slug: 'agriculture', icon: '🌾' },
  { name: 'Commission', slug: 'commission', icon: '🤝' },
  { name: 'Allowance', slug: 'allowance', icon: '💵' },
  { name: 'Gift', slug: 'gift', icon: '🎁' },
  { name: 'Bonus', slug: 'bonus', icon: '🎉' },
  { name: 'Side Hustle', slug: 'side-hustle', icon: '🚀' },
  { name: 'Interest', slug: 'interest', icon: '💹' },
  { name: 'Royalties', slug: 'royalties', icon: '📜' },
  { name: 'Other', slug: 'other', icon: '📦' },
];

export const DEFAULT_PAYMENT_METHODS = [
  { name: 'Cash', slug: 'cash', icon: '💵' },
  { name: 'Debit Card', slug: 'debit-card', icon: '💳' },
  { name: 'Credit Card', slug: 'credit-card', icon: '💳' },
  { name: 'Bank Transfer', slug: 'bank-transfer', icon: '🏦' },
  { name: 'Mobile Banking', slug: 'mobile-banking', icon: '📱' },
  { name: 'QR Payment', slug: 'qr-payment', icon: '📷' },
  { name: 'eSewa', slug: 'esewa', icon: '🟢' },
  { name: 'Khalti', slug: 'khalti', icon: '🟣' },
  { name: 'Fonepay', slug: 'fonepay', icon: '🔵' },
  { name: 'PayPal', slug: 'paypal', icon: '🅿️' },
  { name: 'Stripe', slug: 'stripe', icon: '💠' },
  { name: 'Apple Pay', slug: 'apple-pay', icon: '🍎' },
  { name: 'Google Pay', slug: 'google-pay', icon: '🇬' },
  { name: 'Crypto', slug: 'crypto', icon: '₿' },
  { name: 'Other', slug: 'other', icon: '📦' },
];

export type CategorySeed = {
  name: string;
  slug: string;
  color: string;
  icon?: string;
  children?: Array<{ name: string; slug: string; color: string; icon?: string }>;
};

export const HIERARCHICAL_EXPENSE_CATEGORIES: CategorySeed[] = [
  {
    name: 'Home',
    slug: 'home',
    color: '#64748b',
    icon: '🏠',
    children: [
      { name: 'Rent', slug: 'rent', color: '#64748b', icon: '🔑' },
      { name: 'Mortgage', slug: 'mortgage', color: '#475569', icon: '🏛️' },
      { name: 'Furniture', slug: 'furniture', color: '#78716c', icon: '🛋️' },
      { name: 'Repairs', slug: 'repairs', color: '#a8a29e', icon: '🔧' },
    ],
  },
  {
    name: 'Utilities',
    slug: 'utilities',
    color: '#f97316',
    icon: '⚡',
    children: [
      { name: 'Electricity', slug: 'electricity', color: '#f59e0b', icon: '💡' },
      { name: 'Water', slug: 'water', color: '#0ea5e9', icon: '💧' },
      { name: 'Internet', slug: 'internet', color: '#3b82f6', icon: '🌐' },
      { name: 'WiFi', slug: 'wifi', color: '#2563eb', icon: '📶' },
      { name: 'Mobile Recharge', slug: 'mobile-recharge', color: '#6366f1', icon: '📱' },
      { name: 'Gas', slug: 'gas', color: '#ef4444', icon: '🔥' },
    ],
  },
  {
    name: 'Food',
    slug: 'food',
    color: '#ef4444',
    icon: '🍽️',
    children: [
      { name: 'Grocery', slug: 'grocery', color: '#22c55e', icon: '🛒' },
      { name: 'Vegetables', slug: 'vegetables', color: '#16a34a', icon: '🥬' },
      { name: 'Restaurant', slug: 'restaurant', color: '#f97316', icon: '🍴' },
      { name: 'Snacks', slug: 'snacks', color: '#eab308', icon: '🍿' },
      { name: 'Tea/Coffee', slug: 'tea-coffee', color: '#92400e', icon: '☕' },
    ],
  },
  {
    name: 'Transportation',
    slug: 'transportation',
    color: '#3b82f6',
    icon: '🚌',
    children: [
      { name: 'Fuel', slug: 'fuel', color: '#1d4ed8', icon: '⛽' },
      { name: 'Taxi', slug: 'taxi', color: '#eab308', icon: '🚕' },
      { name: 'Bus', slug: 'bus', color: '#0ea5e9', icon: '🚌' },
      { name: 'Bike', slug: 'bike', color: '#14b8a6', icon: '🏍️' },
      { name: 'Car Maintenance', slug: 'car-maintenance', color: '#64748b', icon: '🔧' },
      { name: 'Parking', slug: 'parking', color: '#6b7280', icon: '🅿️' },
    ],
  },
  {
    name: 'Family',
    slug: 'family',
    color: '#ec4899',
    icon: '👨‍👩‍👧',
    children: [
      { name: 'School Fee', slug: 'school-fee', color: '#14b8a6', icon: '🎓' },
      { name: 'Child Care', slug: 'child-care', color: '#f472b6', icon: '👶' },
      { name: 'Pocket Money', slug: 'pocket-money', color: '#a855f7', icon: '🪙' },
      { name: 'Parents Support', slug: 'parents-support', color: '#db2777', icon: '💝' },
    ],
  },
  {
    name: 'Health',
    slug: 'health',
    color: '#ec4899',
    icon: '🏥',
    children: [
      { name: 'Medicine', slug: 'medicine', color: '#ef4444', icon: '💊' },
      { name: 'Hospital', slug: 'hospital', color: '#dc2626', icon: '🏥' },
      { name: 'Insurance', slug: 'insurance', color: '#0ea5e9', icon: '🛡️' },
      { name: 'Gym', slug: 'gym', color: '#22c55e', icon: '🏋️' },
    ],
  },
  {
    name: 'Shopping',
    slug: 'shopping',
    color: '#eab308',
    icon: '🛍️',
    children: [
      { name: 'Clothes', slug: 'clothes', color: '#a855f7', icon: '👕' },
      { name: 'Shoes', slug: 'shoes', color: '#78716c', icon: '👟' },
      { name: 'Electronics', slug: 'electronics', color: '#3b82f6', icon: '📱' },
      { name: 'Beauty', slug: 'beauty', color: '#f472b6', icon: '💄' },
    ],
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    color: '#a855f7',
    icon: '🎬',
    children: [
      { name: 'Movies', slug: 'movies', color: '#7c3aed', icon: '🎥' },
      { name: 'Games', slug: 'games', color: '#6366f1', icon: '🎮' },
      { name: 'Netflix', slug: 'netflix', color: '#e11d48', icon: '📺' },
      { name: 'Spotify', slug: 'spotify', color: '#22c55e', icon: '🎵' },
      { name: 'YouTube Premium', slug: 'youtube-premium', color: '#ef4444', icon: '▶️' },
    ],
  },
  {
    name: 'Finance',
    slug: 'finance',
    color: '#22c55e',
    icon: '💰',
    children: [
      { name: 'Loan EMI', slug: 'loan-emi', color: '#f97316', icon: '📉' },
      { name: 'Credit Card', slug: 'credit-card-bill', color: '#ef4444', icon: '💳' },
      { name: 'Taxes', slug: 'taxes', color: '#64748b', icon: '🧾' },
      { name: 'Savings', slug: 'savings', color: '#16a34a', icon: '🏦' },
      { name: 'Investments', slug: 'investments-expense', color: '#0ea5e9', icon: '📈' },
    ],
  },
  {
    name: 'Others',
    slug: 'others',
    color: '#6b7280',
    icon: '📦',
    children: [
      { name: 'Charity', slug: 'charity', color: '#14b8a6', icon: '❤️' },
      { name: 'Donation', slug: 'donation', color: '#0d9488', icon: '🤝' },
      { name: 'Gifts', slug: 'gifts', color: '#ec4899', icon: '🎁' },
      { name: 'Miscellaneous', slug: 'miscellaneous', color: '#6b7280', icon: '📦' },
    ],
  },
];

export const GOAL_TEMPLATES = [
  { title: 'Emergency Fund', category: 'savings', priority: 'high' },
  { title: 'Buy House', category: 'home', priority: 'high' },
  { title: 'Buy Bike', category: 'transport', priority: 'medium' },
  { title: 'Buy Car', category: 'transport', priority: 'medium' },
  { title: 'Education Fund', category: 'education', priority: 'high' },
  { title: 'Marriage Fund', category: 'family', priority: 'medium' },
  { title: 'Vacation', category: 'lifestyle', priority: 'low' },
  { title: 'Retirement', category: 'retirement', priority: 'high' },
  { title: 'Investment Goal', category: 'investment', priority: 'medium' },
  { title: 'Debt Free Goal', category: 'debt', priority: 'high' },
];

export const RECURRING_TEMPLATES = [
  { name: 'Salary', direction: 'income', frequency: 'monthly', categorySlug: 'salary' },
  { name: 'Pension', direction: 'income', frequency: 'monthly', categorySlug: 'pension' },
  { name: 'Rental Income', direction: 'income', frequency: 'monthly', categorySlug: 'rental-income' },
  { name: 'Rent', direction: 'expense', frequency: 'monthly', categorySlug: 'rent' },
  { name: 'Internet', direction: 'expense', frequency: 'monthly', categorySlug: 'internet' },
  { name: 'WiFi', direction: 'expense', frequency: 'monthly', categorySlug: 'wifi' },
  { name: 'Electricity', direction: 'expense', frequency: 'monthly', categorySlug: 'electricity' },
  { name: 'Water', direction: 'expense', frequency: 'monthly', categorySlug: 'water' },
  { name: 'Gas', direction: 'expense', frequency: 'monthly', categorySlug: 'gas' },
  { name: 'School Fee', direction: 'expense', frequency: 'monthly', categorySlug: 'school-fee' },
  { name: 'EMI', direction: 'expense', frequency: 'monthly', categorySlug: 'loan-emi' },
  { name: 'Insurance', direction: 'expense', frequency: 'monthly', categorySlug: 'insurance' },
  { name: 'Netflix', direction: 'expense', frequency: 'monthly', categorySlug: 'netflix' },
  { name: 'Spotify', direction: 'expense', frequency: 'monthly', categorySlug: 'spotify' },
  { name: 'YouTube Premium', direction: 'expense', frequency: 'monthly', categorySlug: 'youtube-premium' },
  { name: 'Gym Membership', direction: 'expense', frequency: 'monthly', categorySlug: 'gym' },
  { name: 'Mobile Recharge', direction: 'expense', frequency: 'monthly', categorySlug: 'mobile-recharge' },
  { name: 'Credit Card Bill', direction: 'expense', frequency: 'monthly', categorySlug: 'credit-card-bill' },
];

export const DASHBOARD_WIDGETS = [
  'balance',
  'income',
  'expense',
  'cash_flow',
  'budget_progress',
  'category_breakdown',
  'upcoming_bills',
  'recent_transactions',
  'family_spending',
  'savings_goals',
  'loan_tracker',
] as const;

export const DEFAULT_DASHBOARD_WIDGETS = [
  'balance',
  'income',
  'expense',
  'budget_progress',
  'category_breakdown',
  'recent_transactions',
  'upcoming_bills',
  'savings_goals',
];

export const FISCAL_YEAR_PRESETS = {
  calendar: { start: '01-01', end: '12-31', label: 'Calendar Year (Jan - Dec)' },
  nepal: { start: '07-16', end: '07-15', label: 'Nepal Fiscal Year' },
  india: { start: '04-01', end: '03-31', label: 'India Fiscal Year' },
};
