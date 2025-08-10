import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PurchasedCourse {
  id: string;
  item_id: string;
  item_type: 'one_on_one' | 'short_program' | 'financial_tool';
  purchase_date: string;
  status: string;
  course_title: string;
  course_description?: string;
  price_paid: number;
}

export const usePurchasedCourses = (userId: string | null) => {
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchasedCourses = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Get user's purchases
      const { data: purchases, error: purchaseError } = await supabase
        .from('individual_purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'purchased');

      if (purchaseError) throw purchaseError;

      if (!purchases || purchases.length === 0) {
        setPurchasedCourses([]);
        return;
      }

      // Get course details for each purchase
      const coursePromises = purchases.map(async (purchase) => {
        let courseData = null;

        try {
          switch (purchase.item_type) {
            case 'one_on_one': {
              const { data, error } = await supabase
                .from('one_on_one_sessions')
                .select('id, title, description, price_inr')
                .eq('id', purchase.item_id)
                .single();
              if (!error && data) courseData = data;
              break;
            }
            case 'short_program': {
              const { data, error } = await supabase
                .from('short_programs')
                .select('id, title, description, price_inr')
                .eq('id', purchase.item_id)
                .single();
              if (!error && data) courseData = data;
              break;
            }
            case 'financial_tool': {
              const { data, error } = await supabase
                .from('financial_tools')
                .select('id, title, description, price_inr')
                .eq('id', purchase.item_id)
                .single();
              if (!error && data) courseData = data;
              break;
            }
            default:
              return null;
          }
        } catch (error) {
          console.error('Error fetching course data:', error);
          return null;
        }

        if (!courseData) return null;

        return {
          id: purchase.id,
          item_id: purchase.item_id,
          item_type: purchase.item_type,
          purchase_date: purchase.purchase_date,
          status: purchase.status,
          course_title: courseData.title,
          course_description: courseData.description,
          price_paid: purchase.amount_paid
        } as PurchasedCourse;
      });

      const resolvedCourses = await Promise.all(coursePromises);
      const validCourses = resolvedCourses.filter(Boolean) as PurchasedCourse[];
      
      setPurchasedCourses(validCourses);
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
      setPurchasedCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasedCourses();
  }, [userId]);

  return {
    purchasedCourses,
    loading,
    refetch: fetchPurchasedCourses
  };
};