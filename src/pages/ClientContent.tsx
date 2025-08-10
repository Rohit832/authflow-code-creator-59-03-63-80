import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientContent = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/client/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-semibold text-sm sm:text-base">finsage consult</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Content Library</h1>
          <p className="text-gray-600 mb-6">
            This feature is currently under development. We're working hard to bring you an amazing content library experience.
          </p>
          <Button 
            onClick={() => navigate('/client/dashboard')} 
            variant="outline"
          >
            Return to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ClientContent;