import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, MapPin, Mail, Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ClientRegistrationModal from './ClientRegistrationModal';

interface Inquiry {
  id: string;
  first_name: string;
  last_name: string;
  work_email: string;
  mobile_number?: string;
  job_title?: string;
  company_name: string;
  company_size?: string;
  country?: string;
  message?: string;
  status: string;
  created_at: string;
  updated_at: string;
  client_ip?: string;
}

interface InquiryCardProps {
  inquiry: Inquiry;
  onStatusUpdate: (id: string, status: string) => void;
}

const InquiryCard: React.FC<InquiryCardProps> = ({ inquiry, onStatusUpdate }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Country code to full name mapping
  const getCountryName = (countryCode: string) => {
    const countryNames: { [key: string]: string } = {
      'US': 'United States',
      'UK': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'ES': 'Spain',
      'IT': 'Italy',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'IE': 'Ireland',
      'PT': 'Portugal',
      'GR': 'Greece',
      'PL': 'Poland',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
      'RO': 'Romania',
      'BG': 'Bulgaria',
      'HR': 'Croatia',
      'SI': 'Slovenia',
      'SK': 'Slovakia',
      'LT': 'Lithuania',
      'LV': 'Latvia',
      'EE': 'Estonia',
      'IN': 'India',
      'CN': 'China',
      'JP': 'Japan',
      'KR': 'South Korea',
      'SG': 'Singapore',
      'MY': 'Malaysia',
      'TH': 'Thailand',
      'ID': 'Indonesia',
      'PH': 'Philippines',
      'VN': 'Vietnam',
      'TW': 'Taiwan',
      'HK': 'Hong Kong',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'AR': 'Argentina',
      'CL': 'Chile',
      'CO': 'Colombia',
      'PE': 'Peru',
      'ZA': 'South Africa',
      'EG': 'Egypt',
      'NG': 'Nigeria',
      'KE': 'Kenya',
      'RU': 'Russia',
      'TR': 'Turkey',
      'SA': 'Saudi Arabia',
      'AE': 'United Arab Emirates',
      'IL': 'Israel',
      'JO': 'Jordan',
      'LB': 'Lebanon',
      'NZ': 'New Zealand'
    };
    return countryNames[countryCode] || countryCode;
  };

  const handleStatusUpdate = (status: string) => {
    onStatusUpdate(inquiry.id, status);
    
    // If manually closing, show congratulations modal
    if (status === 'closed') {
      setShowRegistrationModal(true);
    }
  };

  const handleRegisterClient = () => {
    setShowRegistrationModal(false);
    navigate('/admin/client-registration');
  };

  const handleCloseModal = () => {
    setShowRegistrationModal(false);
    toast({
      title: "Inquiry Closed",
      description: "The inquiry has been successfully closed.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {inquiry.first_name} {inquiry.last_name}
                {inquiry.job_title && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    • {inquiry.job_title}
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">{inquiry.company_name}</span>
                {inquiry.company_size && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-600">{inquiry.company_size}</span>
                  </>
                )}
              </div>
              {inquiry.client_ip && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">IP: {inquiry.client_ip}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${getStatusColor(inquiry.status)} border`}>
                {inquiry.status}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {format(new Date(inquiry.created_at), 'MMM dd, yyyy • HH:mm')}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <a 
                href={`mailto:${inquiry.work_email}`}
                className="text-sm text-blue-600 hover:underline truncate"
              >
                {inquiry.work_email}
              </a>
            </div>
            
            {inquiry.mobile_number && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <a 
                  href={`tel:${inquiry.mobile_number}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {inquiry.mobile_number}
                </a>
              </div>
            )}
          </div>
          
          {inquiry.country && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{getCountryName(inquiry.country)}</span>
            </div>
          )}

          {inquiry.message && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-sm font-medium text-gray-700 mb-2">Message:</div>
              <div className="text-sm text-gray-600 leading-relaxed">{inquiry.message}</div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm font-medium text-gray-700">Update Status:</span>
            <div className="flex gap-2">
              {['new', 'contacted', 'closed'].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={inquiry.status === status ? "default" : "outline"}
                  onClick={() => handleStatusUpdate(status)}
                  className="text-xs capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <ClientRegistrationModal
        isOpen={showRegistrationModal}
        onClose={handleCloseModal}
        onRegisterClient={handleRegisterClient}
        clientName={`${inquiry.first_name} ${inquiry.last_name}`}
        companyName={inquiry.company_name}
      />
    </>
  );
};

export default InquiryCard;
