export const DEFAULT_CATEGORIES = {
  income: [
    { name: 'Salary', icon: 'Banknote', color: '#10b981' },
    { name: 'Freelance', icon: 'Laptop', color: '#06b6d4' },
    { name: 'Investment', icon: 'TrendingUp', color: '#8b5cf6' },
    { name: 'Gift', icon: 'Gift', color: '#f43f5e' },
    { name: 'Refund', icon: 'RotateCcw', color: '#14b8a6' },
    { name: 'Other Income', icon: 'Plus', color: '#64748b' },
  ],
  expense: [
    { name: 'Food', icon: 'UtensilsCrossed', color: '#f97316' },
    { name: 'Transport', icon: 'Car', color: '#3b82f6' },
    { name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
    { name: 'Bills', icon: 'Receipt', color: '#ef4444' },
    { name: 'Entertainment', icon: 'Gamepad2', color: '#a855f7' },
    { name: 'Health', icon: 'Heart', color: '#f43f5e' },
    { name: 'Education', icon: 'GraduationCap', color: '#0ea5e9' },
    { name: 'Travel', icon: 'Plane', color: '#06b6d4' },
    { name: 'Groceries', icon: 'ShoppingCart', color: '#22c55e' },
    { name: 'Rent', icon: 'Home', color: '#6366f1' },
    { name: 'Subscriptions', icon: 'CreditCard', color: '#8b5cf6' },
    { name: 'Other', icon: 'MoreHorizontal', color: '#64748b' },
  ],
};

export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash', icon: 'Banknote' },
  { value: 'upi', label: 'UPI', icon: 'Smartphone' },
  { value: 'card', label: 'Card', icon: 'CreditCard' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: 'Building2' },
];

export const PAYMENT_STATUSES = [
  { value: 'paid', label: 'Paid', color: '#10b981' },
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'failed', label: 'Failed', color: '#ef4444' },
];

export const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Transactions', href: '/transactions', icon: 'ArrowLeftRight' },
  { name: 'UPI Tracker', href: '/upi', icon: 'Smartphone' },
  { name: 'Categories', href: '/categories', icon: 'Grid3X3' },
  { name: 'Reports', href: '/reports', icon: 'BarChart3' },
  { name: 'Import', href: '/import', icon: 'Upload' },
  { name: 'Reminders', href: '/reminders', icon: 'Bell' },
  { name: 'Notifications', href: '/notifications', icon: 'BellRing' },
  { name: 'Settings', href: '/settings', icon: 'Settings' },
];

export const CATEGORY_ICONS = [
  'Banknote', 'Laptop', 'TrendingUp', 'Gift', 'RotateCcw', 'Plus',
  'UtensilsCrossed', 'Car', 'ShoppingBag', 'Receipt', 'Gamepad2', 'Heart',
  'GraduationCap', 'Plane', 'ShoppingCart', 'Home', 'CreditCard', 'MoreHorizontal',
  'Coffee', 'Fuel', 'Wifi', 'Phone', 'Tv', 'Music', 'Book', 'Dumbbell',
  'Briefcase', 'Baby', 'Dog', 'Palette', 'Camera', 'Wrench', 'Zap', 'Umbrella',
];

export const CATEGORY_COLORS = [
  '#f97316', '#ef4444', '#f43f5e', '#ec4899', '#a855f7', '#8b5cf6',
  '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981',
  '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#64748b', '#78716c',
];

// Auto-categorization keywords
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food': ['food', 'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'snack', 'pizza', 'burger', 'biryani', 'zomato', 'swiggy', 'eat'],
  'Transport': ['uber', 'ola', 'taxi', 'fuel', 'petrol', 'diesel', 'metro', 'bus', 'train', 'auto', 'rickshaw', 'parking', 'toll', 'rapido'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'clothes', 'shoes', 'dress', 'shirt', 'mall'],
  'Bills': ['electricity', 'water', 'gas', 'bill', 'recharge', 'mobile', 'broadband', 'internet', 'jio', 'airtel', 'vi'],
  'Entertainment': ['movie', 'netflix', 'prime', 'hotstar', 'spotify', 'game', 'concert', 'theatre', 'disney'],
  'Health': ['hospital', 'doctor', 'medicine', 'pharmacy', 'medical', 'gym', 'yoga', 'health', 'apollo', 'practo'],
  'Education': ['course', 'book', 'tuition', 'school', 'college', 'udemy', 'coursera', 'exam', 'coaching'],
  'Travel': ['hotel', 'flight', 'booking', 'trip', 'travel', 'vacation', 'oyo', 'makemytrip', 'goibibo'],
  'Groceries': ['grocery', 'vegetables', 'fruits', 'milk', 'bigbasket', 'blinkit', 'instamart', 'zepto', 'dmart'],
  'Rent': ['rent', 'lease', 'house', 'apartment', 'flat', 'pg', 'hostel'],
  'Subscriptions': ['subscription', 'premium', 'membership', 'plan', 'annual', 'monthly'],
  'Salary': ['salary', 'payroll', 'wages', 'income', 'stipend', 'bonus'],
  'Freelance': ['freelance', 'client', 'project', 'gig', 'contract', 'consulting'],
  'Investment': ['mutual fund', 'stock', 'share', 'dividend', 'interest', 'fd', 'rd', 'sip', 'investment'],
};

export const UPI_PROVIDERS = [
  { value: 'gpay', label: 'Google Pay', color: '#4285F4', suffix: '@okaxis' },
  { value: 'phonepe', label: 'PhonePe', color: '#5f259f', suffix: '@ybl' },
  { value: 'paytm', label: 'Paytm', color: '#00BAF2', suffix: '@paytm' },
  { value: 'bhim', label: 'BHIM', color: '#00838F', suffix: '@upi' },
  { value: 'other', label: 'Other', color: '#64748b', suffix: '' },
] as const;
