import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Mail, MailOpen, Calendar, Briefcase, User, MessageSquare, RefreshCw } from 'lucide-react';

interface Inquiry {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  event_id: string | null;
  opportunity_id: string | null;
  event?: { title: string } | null;
  opportunity?: { title: string } | null;
}

interface InquiriesInboxProps {
  type: 'college' | 'company' | 'admin';
}

export function InquiriesInbox({ type }: InquiriesInboxProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchInquiries();
    }
  }, [user, type]);

  const fetchInquiries = async () => {
    setIsLoading(true);
    
    let query = supabase
      .from('inquiries')
      .select(`
        *,
        event:events(title),
        opportunity:opportunities(title)
      `)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching inquiries:', error);
    } else {
      setInquiries(data as Inquiry[] || []);
    }
    setIsLoading(false);
  };

  const markAsRead = async (inquiry: Inquiry) => {
    if (inquiry.is_read) return;

    await supabase
      .from('inquiries')
      .update({ is_read: true })
      .eq('id', inquiry.id);

    setInquiries(prev => 
      prev.map(i => i.id === inquiry.id ? { ...i, is_read: true } : i)
    );
  };

  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    markAsRead(inquiry);
  };

  const unreadCount = inquiries.filter(i => !i.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-secondary" />
          <h3 className="font-semibold">Inquiries</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} new</Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchInquiries}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No inquiries yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <Card 
              key={inquiry.id} 
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${!inquiry.is_read ? 'border-secondary' : ''}`}
              onClick={() => handleViewInquiry(inquiry)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {inquiry.is_read ? (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Mail className="h-5 w-5 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`font-medium truncate ${!inquiry.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {inquiry.subject}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(inquiry.created_at))} ago
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {inquiry.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {inquiry.sender_name}
                      </span>
                      {inquiry.event && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {inquiry.event.title}
                        </span>
                      )}
                      {inquiry.opportunity && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {inquiry.opportunity.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedInquiry?.subject}</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{selectedInquiry.sender_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(selectedInquiry.created_at))} ago
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedInquiry.sender_email}</p>
              </div>

              {(selectedInquiry.event || selectedInquiry.opportunity) && (
                <div className="flex items-center gap-2 text-sm">
                  {selectedInquiry.event && (
                    <Badge variant="secondary" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {selectedInquiry.event.title}
                    </Badge>
                  )}
                  {selectedInquiry.opportunity && (
                    <Badge variant="outline" className="gap-1">
                      <Briefcase className="h-3 w-3" />
                      {selectedInquiry.opportunity.title}
                    </Badge>
                  )}
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Message:</p>
                <div className="p-3 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-2">Reply via email:</p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`mailto:${selectedInquiry.sender_email}?subject=Re: ${selectedInquiry.subject}`, '_blank')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Reply to {selectedInquiry.sender_email}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
