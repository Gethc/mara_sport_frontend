import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/contexts/NotificationContext';
import { Bell, Trophy, CreditCard, Gift, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'sport_enrollment':
        return <Trophy className="h-4 w-4 text-primary" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-accent" />;
      case 'sponsorship':
        return <Gift className="h-4 w-4 text-warning" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="h-auto p-1 text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      !notification.read 
                        ? 'bg-primary/5 border border-primary/20 hover:bg-primary/10' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        
        {notifications.length > 10 && (
          <div className="p-3 border-t">
            <Button variant="outline" size="sm" className="w-full">
              View All Notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};