import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Video, Settings, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

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

interface PurchasedCoursesSidebarProps {
  courses: PurchasedCourse[];
  selectedCourse: PurchasedCourse | null;
  onSelectCourse: (course: PurchasedCourse | null) => void;
  loading: boolean;
}

const getIcon = (itemType: string) => {
  switch (itemType) {
    case 'one_on_one':
      return <Video className="h-4 w-4" />;
    case 'short_program':
      return <BookOpen className="h-4 w-4" />;
    case 'financial_tool':
      return <Settings className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

const getCategoryLabel = (itemType: string) => {
  switch (itemType) {
    case 'one_on_one':
      return '1-on-1 Session';
    case 'short_program':
      return 'Short Program';
    case 'financial_tool':
      return 'Financial Tool';
    default:
      return 'Course';
  }
};

export const PurchasedCoursesSidebar = ({
  courses,
  selectedCourse,
  onSelectCourse,
  loading
}: PurchasedCoursesSidebarProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Your Courses
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Chat about your purchased courses
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="px-4 pb-3">
          <div
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-colors border-2",
              !selectedCourse
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted/30 border-transparent hover:bg-muted/50"
            )}
            onClick={() => onSelectCourse(null)}
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4" />
              <div className="font-medium text-sm">General Support</div>
            </div>
            <div className="text-xs text-muted-foreground">
              General questions and financial planning support
            </div>
          </div>
        </div>

        {courses.length > 0 && <Separator />}
        
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No purchased courses yet</p>
                <p className="text-xs mt-1">Purchase courses to chat about them here</p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors border-2",
                    selectedCourse?.id === course.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/30 border-transparent hover:bg-muted/50"
                  )}
                  onClick={() => onSelectCourse(course)}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {getIcon(course.item_type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {course.course_title}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {getCategoryLabel(course.item_type)}
                      </Badge>
                    </div>
                  </div>
                  
                  {course.course_description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {course.course_description}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Purchased {formatDistanceToNow(new Date(course.purchase_date), { addSuffix: true })}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};