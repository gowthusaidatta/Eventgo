import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Eye, Trash2, Edit, MessageSquare, Briefcase, Trophy, Search, Filter } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Event, Opportunity } from '@/lib/types';
import { format } from 'date-fns';
import { InquiriesInbox } from '@/components/InquiriesInbox';
import { CreateEventDialog } from '@/components/college/CreateEventDialog';
import { CreateOpportunityDialog } from '@/components/college/CreateOpportunityDialog';
import { EditEventDialog } from '@/components/college/EditEventDialog';
import { EditOpportunityDialog } from '@/components/college/EditOpportunityDialog';

export default function CollegeDashboard() {
  const { user, profile, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [college, setCollege] = useState<any>(null);
  
  // Search & Filter state
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState<string>('all');
  const [oppSearch, setOppSearch] = useState('');
  const [oppTypeFilter, setOppTypeFilter] = useState<string>('all');
  
  // Edit dialog state
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

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
    const { data: collegeData } = await supabase
      .from('colleges')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    setCollege(collegeData);

    if (collegeData) {
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('college_id', collegeData.id)
        .order('created_at', { ascending: false });
      
      setEvents((eventsData as unknown as Event[]) || []);
    }

    const { data: oppsData } = await supabase
      .from('opportunities')
      .select('*')
      .is('company_id', null)
      .order('created_at', { ascending: false });
    
    setOpportunities((oppsData as unknown as Opportunity[]) || []);
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

  const handleDeleteOpportunity = async (opportunityId: string) => {
    const { error } = await supabase.from('opportunities').delete().eq('id', opportunityId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Opportunity deleted successfully' });
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

  const handleOpportunityToggle = async (opportunityId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('opportunities')
      .update({ is_active: !currentStatus })
      .eq('id', opportunityId);
    
    if (!error) {
      toast({ title: 'Updated', description: `Opportunity ${!currentStatus ? 'activated' : 'deactivated'}` });
      fetchCollegeData();
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      event.city?.toLowerCase().includes(eventSearch.toLowerCase());
    const matchesStatus = eventStatusFilter === 'all' || event.status === eventStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(oppSearch.toLowerCase()) ||
      opp.location?.toLowerCase().includes(oppSearch.toLowerCase());
    const matchesType = oppTypeFilter === 'all' || opp.type === oppTypeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Events', value: events.length, icon: Calendar },
    { label: 'Opportunities', value: opportunities.length, icon: Briefcase },
    { label: 'Published', value: events.filter(e => e.status === 'published').length, icon: Eye },
    { label: 'Total Registrations', value: '0', icon: Users },
  ];

  const getOpportunityTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      hackathon: 'bg-purple-100 text-purple-800',
      competition: 'bg-blue-100 text-blue-800',
      job: 'bg-green-100 text-green-800',
      internship: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">College Dashboard</h1>
              <p className="text-muted-foreground">{college?.name || 'Manage your events and opportunities'}</p>
            </div>
            <div className="flex gap-2">
              {college && (
                <>
                  <CreateEventDialog 
                    collegeId={college.id} 
                    collegeCity={college.city}
                    onEventCreated={fetchCollegeData}
                  />
                  <CreateOpportunityDialog 
                    collegeId={college.id}
                    onOpportunityCreated={fetchCollegeData}
                  />
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

          {/* Events, Opportunities and Inquiries */}
          <Tabs defaultValue="events" className="space-y-4">
            <TabsList>
              <TabsTrigger value="events" className="gap-2">
                <Calendar className="h-4 w-4" /> Events
              </TabsTrigger>
              <TabsTrigger value="opportunities" className="gap-2">
                <Trophy className="h-4 w-4" /> Opportunities
              </TabsTrigger>
              <TabsTrigger value="inquiries" className="gap-2">
                <MessageSquare className="h-4 w-4" /> Inquiries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Your Events</CardTitle>
                      <CardDescription>Manage all your events here</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search events..."
                          value={eventSearch}
                          onChange={(e) => setEventSearch(e.target.value)}
                          className="pl-9 w-48"
                        />
                      </div>
                      <Select value={eventStatusFilter} onValueChange={setEventStatusFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{events.length === 0 ? 'No events yet. Create your first event!' : 'No events match your search.'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 flex items-start gap-4">
                            {event.banner_url && (
                              <img 
                                src={event.banner_url} 
                                alt={event.title}
                                className="w-16 h-16 object-cover rounded-md hidden sm:block"
                              />
                            )}
                            <div>
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
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublishToggle(event.id, event.status)}
                            >
                              {event.status === 'published' ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingEvent(event)}>
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
            </TabsContent>

            <TabsContent value="opportunities">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Your Opportunities</CardTitle>
                      <CardDescription>Manage hackathons, jobs, internships, and competitions</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search opportunities..."
                          value={oppSearch}
                          onChange={(e) => setOppSearch(e.target.value)}
                          className="pl-9 w-48"
                        />
                      </div>
                      <Select value={oppTypeFilter} onValueChange={setOppTypeFilter}>
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="hackathon">Hackathon</SelectItem>
                          <SelectItem value="competition">Competition</SelectItem>
                          <SelectItem value="job">Job</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredOpportunities.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{opportunities.length === 0 ? 'No opportunities yet. Create your first opportunity!' : 'No opportunities match your search.'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOpportunities.map((opp) => (
                        <div
                          key={opp.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 flex items-start gap-4">
                            {opp.image_url && (
                              <img 
                                src={opp.image_url} 
                                alt={opp.title}
                                className="w-16 h-16 object-cover rounded-md hidden sm:block"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{opp.title}</h3>
                                <Badge className={getOpportunityTypeBadge(opp.type)}>
                                  {opp.type}
                                </Badge>
                                <Badge variant={opp.is_active ? 'default' : 'secondary'}>
                                  {opp.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {opp.location || 'Remote'} 
                                {opp.deadline && ` • Deadline: ${format(new Date(opp.deadline), 'MMM dd, yyyy')}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpportunityToggle(opp.id, opp.is_active)}
                            >
                              {opp.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingOpportunity(opp)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteOpportunity(opp.id)}
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
            </TabsContent>

            <TabsContent value="inquiries">
              <Card>
                <CardContent className="pt-6">
                  <InquiriesInbox type="college" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      {/* Edit Dialogs */}
      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          onEventUpdated={fetchCollegeData}
        />
      )}

      {editingOpportunity && (
        <EditOpportunityDialog
          opportunity={editingOpportunity}
          open={!!editingOpportunity}
          onOpenChange={(open) => !open && setEditingOpportunity(null)}
          onOpportunityUpdated={fetchCollegeData}
        />
      )}
    </div>
  );
}
