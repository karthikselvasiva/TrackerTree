-- =============================================
-- TrackerTree - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Circle',
  color TEXT DEFAULT '#64748b',
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_user ON public.categories(user_id);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- 3. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'upi', 'card', 'bank_transfer')) DEFAULT 'cash',
  upi_ref TEXT DEFAULT '',
  status TEXT CHECK (status IN ('paid', 'pending', 'failed')) DEFAULT 'paid',
  notes TEXT DEFAULT '',
  tags TEXT CHECK (tags IS NULL OR tags IN ('business', 'personal')),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- 4. Payment Reminders
CREATE TABLE IF NOT EXISTS public.payment_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  recurring TEXT CHECK (recurring IN ('none', 'daily', 'weekly', 'monthly', 'yearly')) DEFAULT 'none',
  is_paid BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_user ON public.payment_reminders(user_id);
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reminders" ON public.payment_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON public.payment_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.payment_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.payment_reminders FOR DELETE USING (auth.uid() = user_id);

-- 5. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  type TEXT CHECK (type IN ('reminder', 'insight', 'system', 'import')) DEFAULT 'system',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- 6. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);

  -- Seed default expense categories
  INSERT INTO public.categories (user_id, name, icon, color, type, is_default) VALUES
    (NEW.id, 'Food', 'UtensilsCrossed', '#f97316', 'expense', true),
    (NEW.id, 'Transport', 'Car', '#3b82f6', 'expense', true),
    (NEW.id, 'Shopping', 'ShoppingBag', '#ec4899', 'expense', true),
    (NEW.id, 'Bills', 'Receipt', '#ef4444', 'expense', true),
    (NEW.id, 'Entertainment', 'Gamepad2', '#a855f7', 'expense', true),
    (NEW.id, 'Health', 'Heart', '#f43f5e', 'expense', true),
    (NEW.id, 'Education', 'GraduationCap', '#0ea5e9', 'expense', true),
    (NEW.id, 'Travel', 'Plane', '#06b6d4', 'expense', true),
    (NEW.id, 'Groceries', 'ShoppingCart', '#22c55e', 'expense', true),
    (NEW.id, 'Rent', 'Home', '#6366f1', 'expense', true),
    (NEW.id, 'Subscriptions', 'CreditCard', '#8b5cf6', 'expense', true),
    (NEW.id, 'Other', 'MoreHorizontal', '#64748b', 'expense', true),
    (NEW.id, 'Salary', 'Banknote', '#10b981', 'income', true),
    (NEW.id, 'Freelance', 'Laptop', '#06b6d4', 'income', true),
    (NEW.id, 'Investment', 'TrendingUp', '#8b5cf6', 'income', true),
    (NEW.id, 'Gift', 'Gift', '#f43f5e', 'income', true),
    (NEW.id, 'Refund', 'RotateCcw', '#14b8a6', 'income', true),
    (NEW.id, 'Other Income', 'Plus', '#64748b', 'income', true);

  -- Welcome notification
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (NEW.id, 'Welcome to TrackerTree! 🌳', 'Start tracking your expenses and get AI-powered insights.', 'system');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
