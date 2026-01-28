import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send } from 'lucide-react';

interface InquiryFormDialogProps {
  eventId?: string;
  opportunityId?: string;
  targetName: string;
  targetType: 'event' | 'opportunity';
}

export function InquiryFormDialog({ eventId, opportunityId, targetName, targetType }: InquiryFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ 
        title: 'Login Required', 
        description: 'Please login to send an inquiry',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('inquiries').insert({
      sender_id: user.id,
      sender_name: profile?.full_name || 'Anonymous',
      sender_email: profile?.email || user.email || '',
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      event_id: eventId || null,
      opportunity_id: opportunityId || null,
    });

    setLoading(false);

    if (error) {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({ 
        title: 'Inquiry Sent!', 
        description: 'Your message has been sent to the organizer.'
      });
      setFormData({ subject: '', message: '' });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Ask a Question
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Inquiry</DialogTitle>
          <DialogDescription>
            Ask a question about: {targetName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
              Please login to send an inquiry
            </div>
          )}
          
          {user && profile && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
            </div>
          )}

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Registration query, Eligibility question"
              required
              disabled={!user}
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="message">Your Question *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Type your question or doubt here..."
              rows={4}
              required
              disabled={!user}
              maxLength={1000}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !user} className="gap-2">
              <Send className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send Inquiry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
