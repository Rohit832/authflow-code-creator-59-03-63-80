
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
// We'll use a simpler approach without the phone input library

const BookDemo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    work_email: '',
    mobile_country_code: '+91',
    mobile_number: '',
    job_title: '',
    company_name: '',
    company_size: '',
    country: '',
    custom_country: '',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.work_email || !formData.company_name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Include mobile_number in the data sent to admin inquiry section
      const inquiryData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        work_email: formData.work_email,
        mobile_number: formData.mobile_number ? `${formData.mobile_country_code}${formData.mobile_number}` : '', // Combine country code and number
        job_title: formData.job_title,
        company_name: formData.company_name,
        company_size: formData.company_size,
        country: formData.country === 'other' ? formData.custom_country : formData.country,
        message: formData.message
      };

      // Call the Supabase edge function to send the inquiry notification with mobile data
      const { error } = await supabase.functions.invoke('send-inquiry-notification', {
        body: inquiryData
      });

      if (error) {
        console.error('Error sending inquiry:', error);
        toast({
          title: "Error",
          description: "Failed to submit your inquiry. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Demo Request Submitted!",
        description: "Thank you for your interest. Our team will contact you soon.",
      });

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        work_email: '',
        mobile_country_code: '+91',
        mobile_number: '',
        job_title: '',
        company_name: '',
        company_size: '',
        country: '',
        custom_country: '',
        message: ''
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
      {/* Full-width divider line */}
      <div className="w-full border-b border-border"></div>

      {/* Main content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24 py-8 sm:py-12">
        <div className="w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Reach out for any questions or book a demo.
            </h1>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground max-w-2xl lg:max-w-4xl mx-auto">
              <p>
                Join leading companies using Finsage to better their employee wellbeing and workplace outcomes today. 
                Submit the form below or email our sales team directly at{' '}
                <a href="mailto:sales@finsage.dev" className="text-primary hover:underline break-all">
                  sales@finsage.dev
                </a>{' '}
                for demo inquiries.
              </p>
              <p>
                If you are an existing client looking to book an appointment, please view our contact details{' '}
                <a href="#" className="text-primary hover:underline">here</a>{' '}
                or write in to{' '}
                <a href="mailto:clinic@finsage.dev" className="text-primary hover:underline break-all">
                  clinic@finsage.dev
                </a>{' '}
                to our care concierge.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium">
                  First name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium">
                  Last name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Work Email and Mobile Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="work_email" className="text-sm font-medium">
                  Work email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="work_email"
                  type="email"
                  value={formData.work_email}
                  onChange={(e) => handleInputChange('work_email', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile_number" className="text-sm font-medium">
                  Mobile number
                </Label>
                <div className="flex gap-2">
                  <Select value={formData.mobile_country_code} onValueChange={(value) => handleInputChange('mobile_country_code', value)}>
                    <SelectTrigger className="w-[80px] sm:w-[90px]">
                      <SelectValue placeholder="+91">{formData.mobile_country_code}</SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="+91">India +91</SelectItem>
                      <SelectItem value="+1">United States +1</SelectItem>
                      <SelectItem value="+44">United Kingdom +44</SelectItem>
                      <SelectItem value="+61">Australia +61</SelectItem>
                      <SelectItem value="+86">China +86</SelectItem>
                      <SelectItem value="+81">Japan +81</SelectItem>
                      <SelectItem value="+49">Germany +49</SelectItem>
                      <SelectItem value="+33">France +33</SelectItem>
                      <SelectItem value="+55">Brazil +55</SelectItem>
                      <SelectItem value="+7">Russia +7</SelectItem>
                      <SelectItem value="+82">South Korea +82</SelectItem>
                      <SelectItem value="+65">Singapore +65</SelectItem>
                      <SelectItem value="+971">UAE +971</SelectItem>
                      <SelectItem value="+966">Saudi Arabia +966</SelectItem>
                      <SelectItem value="+60">Malaysia +60</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="mobile_number"
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                    placeholder="Enter mobile number"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="job_title" className="text-sm font-medium">
                Job title
              </Label>
              <Input
                id="job_title"
                type="text"
                value={formData.job_title}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-sm font-medium">
                Company name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company_name"
                type="text"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Company Size and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="company_size" className="text-sm font-medium">
                  Company size
                </Label>
                <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">
                  Country
                </Label>
                {formData.country === 'other' ? (
                  <div className="flex gap-2">
                    <Input
                      id="custom_country"
                      type="text"
                      value={formData.custom_country}
                      onChange={(e) => handleInputChange('custom_country', e.target.value)}
                      placeholder="Enter your country"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        handleInputChange('country', '');
                        handleInputChange('custom_country', '');
                      }}
                      className="px-3 py-2 text-sm"
                    >
                      Select from list
                    </Button>
                  </div>
                ) : (
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="JP">Japan</SelectItem>
                      <SelectItem value="CN">China</SelectItem>
                      <SelectItem value="BR">Brazil</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Please enter your message/query here."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full min-h-[120px] resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4 sm:pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 text-base font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Promotional Section - Centered Horizontally */}
      <div className="w-full bg-background">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-24 py-12 sm:py-16 text-center">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-foreground">
                finsage
              </span>
              <div className="w-3 h-3 rounded-full bg-primary"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-foreground leading-tight">
              Bring Finsage to Your Workplace & make financial calm your company's new culture.
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
              Think of it as every employee's personal CA, money mentor, and calm button — rolled into one, 
              and gives HR a massive sigh of relief.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Book a Free Discovery Call
            </Button>
            <Button 
              variant="outline"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg border-2 flex items-center justify-center gap-2 border-foreground text-foreground hover:bg-secondary"
            >
              <span className="text-center sm:text-left">EXPLORE FINSAGE FOR YOUR TEAM</span>
              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-foreground text-background text-sm flex-shrink-0">
                →
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDemo;
