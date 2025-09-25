import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, 
  Trophy, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Search,
  Filter,
  Check
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'announcement' | 'event' | 'payment';
  category: 'registration' | 'event' | 'payment' | 'general' | 'emergency';
  isRead: boolean;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
}

const NotificationsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Registration Deadline Extended",
      message: "Good news! The registration deadline for Basketball tournament has been extended to February 25th, 2024. Don't miss this opportunity to register your team.",
      type: 'info',
      category: 'registration',
      isRead: false,
      timestamp: '2024-02-10 09:30 AM',
      priority: 'medium',
      actionRequired: true
    },
    {
      id: 2,
      title: "Payment Confirmation - Football",
      message: "Your payment of ₹150 for Football Men's Team registration has been successfully processed. Transaction ID: TXN001234567",
      type: 'success',
      category: 'payment',
      isRead: true,
      timestamp: '2024-02-09 03:45 PM',
      priority: 'low'
    },
    {
      id: 3,
      title: "Medical Certificate Required",
      message: "Important: All participants must submit medical certificates before February 20th. Please upload your certificate in the Medical Information section.",
      type: 'warning',
      category: 'general',
      isRead: false,
      timestamp: '2024-02-08 11:00 AM',
      priority: 'high',
      actionRequired: true
    },
    {
      id: 4,
      title: "Football Match Schedule Released",
      message: "The complete schedule for Football tournament has been released. Your first match is on March 15th at 10:00 AM. Check the events section for details.",
      type: 'event',
      category: 'event',
      isRead: false,
      timestamp: '2024-02-07 02:20 PM',
      priority: 'medium'
    },
    {
      id: 5,
      title: "New Sports Category Added",
      message: "We've added Badminton to our sports lineup! Registration is now open with an entry fee of ₹60. Register before March 1st.",
      type: 'announcement',
      category: 'registration',
      isRead: true,
      timestamp: '2024-02-05 10:15 AM',
      priority: 'low'
    },
    {
      id: 6,
      title: "Consent Forms Pending",
      message: "You have 3 pending consent forms that need to be signed. Please complete them in the Consent & Declarations section to ensure your participation.",
      type: 'warning',
      category: 'general',
      isRead: false,
      timestamp: '2024-02-04 04:30 PM',
      priority: 'high',
      actionRequired: true
    },
    {
      id: 7,
      title: "Tennis Tournament Updates",
      message: "The tennis tournament format has been updated to include mixed doubles. Check the updated rules and regulations in the sports registration section.",
      type: 'info',
      category: 'event',
      isRead: true,
      timestamp: '2024-02-03 01:15 PM',
      priority: 'medium'
    },
    {
      id: 8,
      title: "Emergency Contact Update Required",
      message: "Please verify and update your emergency contact information in the Guardian Information section. This is crucial for your safety during events.",
      type: 'warning',
      category: 'emergency',
      isRead: false,
      timestamp: '2024-02-02 09:45 AM',
      priority: 'high',
      actionRequired: true
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-primary" />;
      case 'announcement':
        return <Trophy className="h-5 w-5 text-accent" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'destructive';
      case 'event':
        return 'secondary';
      case 'announcement':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-warning';
      default:
        return 'border-l-muted';
    }
  };

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || notif.type === filterType;
    const matchesCategory = filterCategory === 'all' || notif.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications & Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with important announcements and event notifications
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <Bell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">New messages</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">Urgent items</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action Required</CardTitle>
            <Trophy className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionRequiredCount}</div>
            <p className="text-xs text-muted-foreground">Need response</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="registration">Registration</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'You have no notifications at this time'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`shadow-medium border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.isRead ? 'bg-muted/20' : ''
              } cursor-pointer hover:shadow-large transition-all`}
              onClick={() => markAsRead(notification.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <CardTitle className={`text-lg ${!notification.isRead ? 'font-bold' : 'font-medium'}`}>
                          {notification.title}
                        </CardTitle>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <CardDescription className="text-base">
                        {notification.message}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={getBadgeVariant(notification.type)}>
                      {notification.type}
                    </Badge>
                    {notification.actionRequired && (
                      <Badge variant="outline" className="text-xs border-warning text-warning">
                        Action Required
                      </Badge>
                    )}
                    {notification.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">
                        High Priority
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{notification.timestamp}</span>
                  <div className="flex items-center space-x-2">
                    <span className="capitalize">{notification.category}</span>
                    <span>•</span>
                    <span className="capitalize">{notification.priority} priority</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More (if needed) */}
      {filteredNotifications.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;