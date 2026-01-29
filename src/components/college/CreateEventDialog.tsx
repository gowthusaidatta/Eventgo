import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MediaUpload } from '@/components/admin/MediaUpload';

interface CreateEventDialogProps {
  collegeId: string;
  collegeCity?: string;
  onEventCreated: () => void;
}

export function CreateEventDialog({ collegeId, collegeCity, onEventCreated }: CreateEventDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    venue: '',
    city: '',
    start_date: '',
    end_date: '',
    is_free: true,
    base_price: 0,
    max_participants: 100,
    tags: '',
    banner_url: '',
    video_url: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      short_description: '',
      description: '',
      venue: '',
      city: '',
      start_date: '',
      end_date: '',
      is_free: true,
      base_price: 0,
      max_participants: 100,
      tags: '',
      banner_url: '',
      video_url: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('events')
      .insert({
        college_id: collegeId,
        title: formData.title,
        short_description: formData.short_description,
        description: formData.description,
        venue: formData.venue,
        city: formData.city || collegeCity,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_free: formData.is_free,
        base_price: formData.is_free ? 0 : formData.base_price,
        max_participants: formData.max_participants,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        banner_url: formData.banner_url || null,
        video_url: formData.video_url || null,
        status: 'published',
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
      });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Event created successfully!' });
      setIsOpen(false);
      resetForm();
      onEventCreated();
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-secondary hover:bg-secondary/90">
          <Plus className="h-4 w-4 mr-2" /> Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Fill in the details to create a new event</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="TechFest 2026"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="short_description">Short Description *</Label>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="A brief description for cards"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed event description..."
                rows={4}
              />
            </div>
            
            {/* Media Upload Section */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <MediaUpload
                type="image"
                currentUrl={formData.banner_url}
                onUpload={(url) => setFormData({ ...formData, banner_url: url })}
                onRemove={() => setFormData({ ...formData, banner_url: '' })}
                folder="events"
              />
              <MediaUpload
                type="video"
                currentUrl={formData.video_url}
                onUpload={(url) => setFormData({ ...formData, video_url: url })}
                onRemove={() => setFormData({ ...formData, video_url: '' })}
                folder="events"
              />
            </div>

            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Main Auditorium"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai"
              />
            </div>
            <div>
              <Label htmlFor="start_date">Start Date & Time *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date & Time *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Tech, Coding, Robotics"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                />
                <Label htmlFor="is_free">Free Event</Label>
              </div>
            </div>
            {!formData.is_free && (
              <div>
                <Label htmlFor="base_price">Ticket Price (₹)</Label>
                <Input
                  id="base_price"
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                  min={0}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-secondary hover:bg-secondary/90">
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
