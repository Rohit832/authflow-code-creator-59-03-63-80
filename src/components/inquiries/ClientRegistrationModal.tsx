
import React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { UserPlus, CheckCircle } from 'lucide-react';

interface ClientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClient: () => void;
  clientName: string;
  companyName: string;
}

const ClientRegistrationModal: React.FC<ClientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterClient,
  clientName,
  companyName
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">
            Congratulations!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 mt-2">
            You have successfully closed the inquiry for{' '}
            <span className="font-medium text-gray-900">{clientName}</span> from{' '}
            <span className="font-medium text-gray-900">{companyName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 my-4">
          <p className="text-sm text-blue-800 text-center">
            Ready to take the next step? Register this client to begin their journey with us.
          </p>
        </div>

        <AlertDialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Maybe Later
          </Button>
          <AlertDialogAction asChild>
            <Button
              onClick={onRegisterClient}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register Client
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClientRegistrationModal;
