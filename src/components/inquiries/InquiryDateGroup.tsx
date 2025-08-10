
import React from 'react';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import InquiryCard from './InquiryCard';

interface Inquiry {
  id: string;
  first_name: string;
  last_name: string;
  work_email: string;
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

interface InquiryDateGroupProps {
  inquiries: Inquiry[];
  onStatusUpdate: (id: string, status: string) => void;
}

const getDateGroupLabel = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return 'This Week';
  if (isThisMonth(date)) return 'This Month';
  return format(date, 'MMMM yyyy');
};

const InquiryDateGroup: React.FC<InquiryDateGroupProps> = ({ inquiries, onStatusUpdate }) => {
  // Group inquiries by date
  const groupedInquiries = inquiries.reduce((groups: Record<string, Inquiry[]>, inquiry) => {
    const date = new Date(inquiry.created_at);
    const groupKey = getDateGroupLabel(date);
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(inquiry);
    return groups;
  }, {});

  // Sort groups by recency
  const sortedGroups = Object.entries(groupedInquiries).sort(([a], [b]) => {
    const order = ['Today', 'Yesterday', 'This Week', 'This Month'];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // For month groups, sort by date
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="space-y-8">
      {sortedGroups.map(([groupLabel, groupInquiries]) => (
        <div key={groupLabel} className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">{groupLabel}</h2>
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {groupInquiries.length} {groupInquiries.length === 1 ? 'inquiry' : 'inquiries'}
            </span>
          </div>
          <div className="grid gap-4">
            {groupInquiries.map((inquiry) => (
              <InquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                onStatusUpdate={onStatusUpdate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InquiryDateGroup;
