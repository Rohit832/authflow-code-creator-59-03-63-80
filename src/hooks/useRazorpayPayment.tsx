import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SessionData {
  id: string;
  title: string;
  price: number;
  duration: string;
  category?: string;
  serviceId?: string;
  bookingId?: string;
}

interface UserDetails {
  name: string;
  email: string;
  phone?: string;
}

export const useRazorpayPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async (sessionData: SessionData, userDetails: UserDetails): Promise<{ success?: boolean; error?: string }> => {
    return new Promise(async (resolve, reject) => {
      try {
        setIsProcessing(true);

      // Step 1: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Step 1: Create payment order via edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const { data: orderData, error } = await supabase.functions.invoke('create-razorpay-payment', {
        body: {
          sessionData: {
            id: sessionData.id,
            title: sessionData.title,
            price: sessionData.price,
            duration: sessionData.duration,
            category: sessionData.category || 'consultation',
            serviceId: sessionData.serviceId,
            bookingId: sessionData.bookingId
          },
          userDetails
        }
      });

      if (error) {
        console.error('Payment creation error:', error);
        throw new Error(error.message || 'Failed to create payment order');
      }

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Finsage Consulting',
        description: sessionData.title,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // Step 2: Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                bookingId: orderData.bookingId,
                sessionData: sessionData
              }
            });

            if (verifyError || !verifyData.success) {
              throw new Error(verifyData?.error || 'Payment verification failed');
            }

            toast({
              title: "Payment Successful!",
              description: "Your payment has been processed successfully.",
            });

            // Return success to parent component instead of reloading
            setIsProcessing(false);
            resolve({ success: true });
            
          } catch (verifyErr: any) {
            console.error('Payment verification error:', verifyErr);
            toast({
              title: "Payment Verification Failed",
              description: verifyErr.message || "There was an issue verifying your payment. Please contact support.",
              variant: "destructive",
            });
            setIsProcessing(false);
            resolve({ error: verifyErr.message || "Payment verification failed" });
          }
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone || ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            resolve({ error: "Payment cancelled by user" });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setIsProcessing(false);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      reject(error);
    }
    });
  };

  return {
    initiatePayment,
    isProcessing
  };
};