import { useState, useEffect } from 'react';
import { supabase, withRetry } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Department } from '../types';

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await withRetry(
        () => supabase
          .from('departments')
          .select('*')
          .order('name'),
        'fetchDepartments'
      );

      if (error) throw error;
      setDepartments(data || []);
      setError(null);
    } catch (err: any) {
      const message = err.message || 'Failed to fetch departments';
      console.error('Department fetch error:', err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const addDepartment = async (name: string, description: string) => {
    try {
      const { error } = await withRetry(
        () => supabase
          .from('departments')
          .insert({ name, description }),
        'addDepartment'
      );

      if (error) throw error;
      toast.success('Department added successfully');
      await fetchDepartments();
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  };

  const updateDepartment = async (id: string, name: string, description: string) => {
    try {
      const { error } = await withRetry(
        () => supabase
          .from('departments')
          .update({ name, description })
          .eq('id', id),
        'updateDepartment'
      );

      if (error) throw error;
      toast.success('Department updated successfully');
      await fetchDepartments();
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  };

  return { 
    departments, 
    isLoading, 
    error,
    addDepartment,
    updateDepartment,
    refetch: fetchDepartments
  };
};