'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Transaction, TransactionFilters } from '@/types';
import toast from 'react-hot-toast';

const defaultFilters: TransactionFilters = {
  search: '',
  type: 'all',
  category_id: '',
  payment_mode: '',
  status: '',
  date_from: '',
  date_to: '',
  tag: '',
};

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);
  const supabase = createClient();

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.type !== 'all') query = query.eq('type', filters.type);
    if (filters.category_id) query = query.eq('category_id', filters.category_id);
    if (filters.payment_mode) query = query.eq('payment_mode', filters.payment_mode);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.date_from) query = query.gte('date', filters.date_from);
    if (filters.date_to) query = query.lte('date', filters.date_to);
    if (filters.tag) query = query.eq('tags', filters.tag);
    if (filters.search) query = query.ilike('notes', `%${filters.search}%`);

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to fetch transactions');
      console.error(error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, [user, supabase, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchTransactions]);

  const addTransaction = async (data: Partial<Transaction>): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase.from('transactions').insert({
      ...data,
      user_id: user.id,
    });
    if (error) {
      toast.error('Failed to add transaction');
      console.error(error);
      return false;
    }
    toast.success('Transaction added!');
    return true;
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      toast.error('Failed to update transaction');
      console.error(error);
      return false;
    }
    toast.success('Transaction updated!');
    return true;
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      toast.error('Failed to delete transaction');
      console.error(error);
      return false;
    }
    toast.success('Transaction deleted!');
    return true;
  };

  return {
    transactions,
    loading,
    filters,
    setFilters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: fetchTransactions,
  };
}
