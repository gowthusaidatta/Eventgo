import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users, Eye, Settings, Trash2, Edit } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/lib/types';
import { format } from 'date-fns';

export default function CollegeDashboard() {
  const { user, profile, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [college, setCollege] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
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
  });

  useEffect(() => {
    if (!isLoading && (!user || role !== 'college')) {
      navigate('/login');
    }
  }, [user, role, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCollegeData();
    }
  }, [user]);

  const fetchCollegeData = async () => {
    // Fetch college
    const { data: collegeData } = await supabase
      .from('colleges')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    setCollege(collegeData);

    if (collegeData) {
      // Fetch events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('college_id', collegeData.id)
        .order('created_at', { ascending: false });
      
      setEvents((eventsData as unknown as Event[]) || []);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college) return;
    
    setIsSubmitting(true);

    const { error } = await supabase
      .from('events')
      .insert({
        college_id: college.id,
        title: formData.title,
        short_description: formData.short_description,
        description: formData.description,
        venue: formData.venue,
        city: formData.city || college.city,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_free: formData.is_free,
        base_price: formData.is_free ? 0 : formData.base_price,
        max_participants: formData.max_participants,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        status: 'published',
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
      });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Event created successfully!' });
      setIsDialogOpen(false);
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
      });
      fetchCollegeData();
    }
    setIsSubmitting(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Event deleted successfully' });
      fetchCollegeData();
    }
  };

  const handlePublishToggle = async (eventId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const { error } = await supabase
      .from('events')
      .update({ status: newStatus })
      .eq('id', eventId);
    
    if (!error) {
      toast({ title: 'Updated', description: `Event ${newStatus}` });
      fetchCollegeData();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Events', value: events.length, icon: Calendar },
    { label: 'Published', value: events.filter(e => e.status === 'published').length, icon: Eye },
    { label: 'Total Registrations', value: '0', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">College Dashboard</h1>
              <p className="text-muted-foreground">{college?.name || 'Manage your events'}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <form onSubmit={handleCreateEvent} className="space-y-4">
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
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-secondary hover:bg-secondary/90">
                      {isSubmitting ? 'Creating...' : 'Create Event'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-secondary" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Events</CardTitle>
              <CardDescription>Manage all your events here</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events yet. Create your first event!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                          {!event.is_free && (
                            <Badge variant="outline">₹{event.base_price}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.start_date), 'MMM dd, yyyy')} • {event.city || 'TBD'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePublishToggle(event.id, event.status)}
                        >
                          {event.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
