
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, CheckCircle, Users } from 'lucide-react';

interface Inquiry {
  id: string;
  status: string;
  created_at: string;
}

interface InquiryStatsProps {
  inquiries: Inquiry[];
}

const InquiryStats: React.FC<InquiryStatsProps> = ({ inquiries }) => {
  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    closed: inquiries.filter(i => i.status === 'closed').length,
  };

  const todayInquiries = inquiries.filter(inquiry => {
    const today = new Date();
    const inquiryDate = new Date(inquiry.created_at);
    return inquiryDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Today</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{todayInquiries}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New</CardTitle>
          <Badge className="bg-blue-100 text-blue-800">{stats.new}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contacted</CardTitle>
          <Badge className="bg-yellow-100 text-yellow-800">{stats.contacted}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Closed</CardTitle>
          <Badge className="bg-green-100 text-green-800">{stats.closed}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.closed}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InquiryStats;
