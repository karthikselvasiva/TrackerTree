-- =============================================
-- TrackerTree - UPI Accounts Extension
-- Run this AFTER the main schema.sql
-- =============================================

-- 8. UPI Accounts
CREATE TABLE IF NOT EXISTS public.upi_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  upi_id TEXT NOT NULL,
  provider TEXT CHECK (provider IN ('gpay', 'phonepe', 'paytm', 'bhim', 'other')) DEFAULT 'other',
  label TEXT DEFAULT '',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_upi_accounts_user ON public.upi_accounts(user_id);
ALTER TABLE public.upi_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own UPI accounts" ON public.upi_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own UPI accounts" ON public.upi_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own UPI accounts" ON public.upi_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own UPI accounts" ON public.upi_accounts FOR DELETE USING (auth.uid() = user_id);

-- 9. UPI Contacts (people you pay/receive from frequently)
CREATE TABLE IF NOT EXISTS public.upi_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  upi_id TEXT NOT NULL,
  total_paid DECIMAL(12,2) DEFAULT 0,
  total_received DECIMAL(12,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  last_transaction_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_upi_contacts_user ON public.upi_contacts(user_id);
ALTER TABLE public.upi_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own UPI contacts" ON public.upi_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own UPI contacts" ON public.upi_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own UPI contacts" ON public.upi_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own UPI contacts" ON public.upi_contacts FOR DELETE USING (auth.uid() = user_id);

-- Add UPI-specific columns to transactions if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'upi_payee') THEN
    ALTER TABLE public.transactions ADD COLUMN upi_payee TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'upi_payer') THEN
    ALTER TABLE public.transactions ADD COLUMN upi_payer TEXT DEFAULT '';
  END IF;
END $$;
