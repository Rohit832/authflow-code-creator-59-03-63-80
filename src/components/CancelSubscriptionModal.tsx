import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, X, DollarSign, BookOpen, Users, Star, TrendingUp, Clock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirmCancel
}) => {
  const [currentStep, setCurrentStep] = useState<'benefits' | 'confirm'>('benefits');

  const benefits = [
    {
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      title: "Exclusive Financial Content",
      description: "Access to premium financial planning guides, investment strategies, and market insights",
      lossText: "You'll lose access to all premium educational content"
    },
    {
      icon: <Users className="w-6 h-6 text-green-600" />,
      title: "1-on-1 Expert Coaching",
      description: "Personalized sessions with certified financial advisors tailored to your goals",
      lossText: "No more personalized financial guidance from experts"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      title: "Portfolio Tracking Tools",
      description: "Advanced analytics and tracking tools to monitor your financial progress",
      lossText: "You'll lose access to advanced portfolio tracking features"
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      title: "Priority Support",
      description: "24/7 priority customer support and faster response times",
      lossText: "You'll be moved to standard support with longer wait times"
    },
    {
      icon: <Clock className="w-6 h-6 text-red-600" />,
      title: "Flexible Scheduling",
      description: "Book sessions at your convenience with easy rescheduling options",
      lossText: "You'll lose flexible booking privileges and priority scheduling"
    }
  ];

  const handleContinueToCancel = () => {
    setCurrentStep('confirm');
  };

  const handleBackToBenefits = () => {
    setCurrentStep('benefits');
  };

  const handleConfirmCancellation = () => {
    onConfirmCancel();
    onClose();
    setCurrentStep('benefits'); // Reset for next time
  };

  const handleKeepSubscription = () => {
    onClose();
    setCurrentStep('benefits'); // Reset for next time
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {currentStep === 'benefits' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-center">
                <AlertTriangle className="w-7 h-7 text-orange-600" />
                Wait! Here's what you'll be missing out on...
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Benefits Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-gray-50">
                          {benefit.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{benefit.description}</p>
                          <div className="flex items-start gap-2 p-2 bg-red-50 rounded-md">
                            <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-700">{benefit.lossText}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Special Offer Section */}
              <Card className="border-l-4 border-l-green-500 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-bold text-green-800">Special Retention Offer</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-green-700">
                      <strong>Stay with us and get 20% off your next session!</strong>
                    </p>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Continue building your financial knowledge
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Keep your progress and session history
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Access to new features and tools
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleKeepSubscription}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Keep My Subscription & Get 20% Off
                </Button>
                
                <Button 
                  onClick={handleContinueToCancel}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  size="lg"
                >
                  I Still Want to Cancel
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center text-red-700">
                Confirm Cancellation
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-red-800 mb-2">
                    Are you absolutely sure?
                  </h3>
                  <p className="text-red-700 mb-4">
                    This action will cancel your subscription and you will lose access to all premium features.
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Refund Policy</h4>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>✅ <strong>Full refund</strong> for unused sessions if cancelled within 24 hours of booking</p>
                      <p>✅ <strong>90% refund</strong> for unused sessions if cancelled after 24 hours</p>
                      <p>✅ <strong>Pro-rated refund</strong> for subscription fees based on remaining time</p>
                      <p className="text-xs text-gray-500 mt-3">
                        Refunds will be processed within 7-10 business days to your original payment method.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Final Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleBackToBenefits}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  ← Back to Benefits
                </Button>
                
                <Button 
                  onClick={handleKeepSubscription}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  Keep My Subscription
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      size="lg"
                    >
                      Confirm Cancellation
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                      <AlertDialogDescription>
                        This is your last chance to keep your subscription. Once cancelled, you'll lose access to all premium features and your progress will be paused.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleConfirmCancellation}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Cancel My Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CancelSubscriptionModal;