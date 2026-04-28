'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('name');

    if (error) {
      toast.error('Failed to fetch categories');
      console.error(error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (data: Partial<Category>): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase.from('categories').insert({
      ...data,
      user_id: user.id,
      is_default: false,
    });
    if (error) {
      toast.error('Failed to add category');
      console.error(error);
      return false;
    }
    toast.success('Category added!');
    await fetchCategories();
    return true;
  };

  const updateCategory = async (id: string, data: Partial<Category>): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      toast.error('Failed to update category');
      console.error(error);
      return false;
    }
    toast.success('Category updated!');
    await fetchCategories();
    return true;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('is_default', false);
    if (error) {
      toast.error('Cannot delete default category');
      console.error(error);
      return false;
    }
    toast.success('Category deleted!');
    await fetchCategories();
    return true;
  };

  return { categories, loading, addCategory, updateCategory, deleteCategory, refresh: fetchCategories };
}
