import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, X, DollarSign, BookOpen, Users, Clock, Target, TrendingUp } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface SessionCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
  sessionTitle: string;
  sessionDate: string;
  sessionAmount: number;
}

const SessionCancellationModal: React.FC<SessionCancellationModalProps> = ({
  isOpen,
  onClose,
  onConfirmCancel,
  sessionTitle,
  sessionDate,
  sessionAmount
}) => {
  const [currentStep, setCurrentStep] = useState<'benefits' | 'confirm'>('benefits');

  const sessionBenefits = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Expert Personal Guidance",
      description: "One-on-one session with certified financial advisor tailored to your specific goals",
      lossText: "You'll miss out on personalized advice for your unique financial situation"
    },
    {
      icon: <Target className="w-6 h-6 text-green-600" />,
      title: "Customized Financial Plan",
      description: "Get a detailed action plan designed specifically for your financial objectives",
      lossText: "You'll lose the opportunity to get a tailored roadmap for your finances"
    },
    {
      icon: <BookOpen className="w-6 h-6 text-purple-600" />,
      title: "Exclusive Learning Materials",
      description: "Access to session recordings, personalized worksheets, and follow-up resources",
      lossText: "You won't receive custom materials and session recordings"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
      title: "Portfolio Review & Optimization",
      description: "Professional analysis of your current investments and optimization recommendations",
      lossText: "Your portfolio won't get expert review and optimization suggestions"
    },
    {
      icon: <Clock className="w-6 h-6 text-red-600" />,
      title: "Limited Availability",
      description: "Our expert advisors have limited slots, and rebooking may have extended wait times",
      lossText: "You might have to wait weeks to get another slot with our top advisors"
    }
  ];

  const getRefundAmount = () => {
    const sessionDate_obj = new Date(sessionDate);
    const now = new Date();
    const timeDiff = sessionDate_obj.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff > 24) {
      return {
        percentage: 100,
        amount: sessionAmount,
        policy: "Full refund - cancelled more than 24 hours in advance"
      };
    } else if (hoursDiff > 1) {
      return {
        percentage: 90,
        amount: Math.floor(sessionAmount * 0.9),
        policy: "90% refund - 10% cancellation fee applies"
      };
    } else {
      return {
        percentage: 50,
        amount: Math.floor(sessionAmount * 0.5),
        policy: "50% refund - cancelled within 1 hour of session"
      };
    }
  };

  const refundInfo = getRefundAmount();

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

  const handleKeepSession = () => {
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
                Wait! Don't miss out on your {sessionTitle} session
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Session Info */}
              <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Your Upcoming Session</h3>
                  <div className="text-sm text-blue-800">
                    <p><strong>Session:</strong> {sessionTitle}</p>
                    <p><strong>Date:</strong> {new Date(sessionDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                    <p><strong>Investment:</strong> ₹{sessionAmount.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {sessionBenefits.map((benefit, index) => (
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

              {/* Alternative Offer Section */}
              <Card className="border-l-4 border-l-green-500 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-bold text-green-800">Need to Reschedule Instead?</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-green-700">
                      <strong>Free rescheduling available!</strong> No penalties or fees.
                    </p>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Reschedule up to 2 hours before your session
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Keep all your session benefits and materials
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Choose from available slots that fit your schedule
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleKeepSession}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Keep My Session
                </Button>
                
                <Button 
                  onClick={() => {/* Add reschedule functionality */}}
                  variant="outline"
                  className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  size="lg"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Reschedule Instead
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
                Cancel Session - Refund Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-red-800 mb-2">
                    Confirm Session Cancellation
                  </h3>
                  <p className="text-red-700 mb-4">
                    You're about to cancel your {sessionTitle} session scheduled for {new Date(sessionDate).toLocaleDateString()}.
                  </p>
                  
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Your Refund Details</h4>
                    </div>
                    <div className="text-sm text-gray-600 space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Session Amount:</span>
                        <span className="font-semibold">₹{sessionAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Refund Percentage:</span>
                        <span className="font-semibold text-green-600">{refundInfo.percentage}%</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="font-semibold">Refund Amount:</span>
                        <span className="font-bold text-green-600 text-lg">₹{refundInfo.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 p-2 bg-gray-50 rounded">
                        <strong>Policy:</strong> {refundInfo.policy}
                      </p>
                      <p className="text-xs text-gray-500">
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
                  onClick={handleKeepSession}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  Keep My Session
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
                        You will receive a refund of ₹{refundInfo.amount.toLocaleString()} ({refundInfo.percentage}%). 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Session</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleConfirmCancellation}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Cancel Session
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

export default SessionCancellationModal;