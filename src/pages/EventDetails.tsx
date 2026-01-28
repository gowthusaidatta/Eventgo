import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, IndianRupee, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/lib/types';
import { format } from 'date-fns';
import { InquiryFormDialog } from '@/components/InquiryFormDialog';

// Sample events for fallback
const sampleEvents: Event[] = [
  {
    id: '1',
    college_id: '1',
    title: 'TechFest 2026 - Annual Technical Festival',
    short_description: 'Join the biggest tech fest with coding competitions, robotics, and more!',
    description: 'Annual technical festival featuring coding competitions, robotics, workshops, and guest lectures from industry experts. Join thousands of students from across the country for three days of innovation, learning, and fun!',
    banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
    venue: 'Main Campus Auditorium',
    city: 'Mumbai',
    start_date: '2026-02-15T09:00:00Z',
    end_date: '2026-02-17T18:00:00Z',
    is_free: false,
    base_price: 299,
    status: 'published',
    tags: ['Tech', 'Coding', 'Robotics'],
    is_featured: true,
    view_count: 1250,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    college_id: '2',
    title: 'Innovate 2026 - Startup Summit',
    short_description: 'Connect with investors, pitch your ideas, and learn from successful founders.',
    description: 'A two-day summit bringing together aspiring entrepreneurs, successful founders, and investors. Network, learn, and pitch your startup idea to leading VCs!',
    banner_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=60',
    venue: 'Convention Center',
    city: 'Bangalore',
    start_date: '2026-03-01T10:00:00Z',
    end_date: '2026-03-02T17:00:00Z',
    is_free: true,
    base_price: 0,
    status: 'published',
    tags: ['Startup', 'Innovation', 'Networking'],
    is_featured: true,
    view_count: 890,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    college_id: '3',
    title: 'Cultural Night - Euphoria 2026',
    short_description: 'Experience music, dance, drama, and art at the biggest cultural extravaganza.',
    description: 'Annual cultural festival featuring performances, competitions, and celebrity appearances. Three nights of music, dance, drama, and art!',
    banner_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60',
    venue: 'Open Air Theatre',
    city: 'Delhi',
    start_date: '2026-02-20T17:00:00Z',
    end_date: '2026-02-22T23:00:00Z',
    is_free: false,
    base_price: 199,
    status: 'published',
    tags: ['Cultural', 'Music', 'Dance'],
    is_featured: true,
    view_count: 2100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isSampleEvent, setIsSampleEvent] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if (user && event && !isSampleEvent) {
      checkRegistration();
    }
  }, [user, event, isSampleEvent]);

  const fetchEventDetails = async () => {
    // First try to fetch from database
    const { data, error } = await supabase
      .from('events')
      .select('*, college:colleges(*)')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      setEvent(data as unknown as Event);
      setIsSampleEvent(false);
    } else {
      // Fallback to sample events
      const sampleEvent = sampleEvents.find(e => e.id === id);
      if (sampleEvent) {
        setEvent(sampleEvent);
        setIsSampleEvent(true);
      } else {
        toast({ title: 'Error', description: 'Event not found', variant: 'destructive' });
        navigate('/events');
        return;
      }
    }
    setIsLoading(false);
  };

  const checkRegistration = async () => {
    const { data } = await supabase
      .from('registrations')
      .select('id')
      .eq('user_id', user?.id)
      .eq('event_id', id)
      .maybeSingle();

    setIsRegistered(!!data);
  };

  const handleRegister = async () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please login to register for events' });
      navigate('/login');
      return;
    }

    if (isSampleEvent) {
      toast({ 
        title: 'Demo Event', 
        description: 'This is a sample event. Registration is simulated!',
      });
      setRegistrationComplete(true);
      setIsRegistered(true);
      return;
    }

    if (!event?.is_free) {
      setShowPaymentDialog(true);
      return;
    }

    await processRegistration();
  };

  const processRegistration = async () => {
    if (isSampleEvent) {
      setRegistrationComplete(true);
      setIsRegistered(true);
      toast({ title: 'Success!', description: 'Demo registration complete!' });
      return;
    }

    setIsProcessing(true);

    // Create registration
    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .insert({
        user_id: user?.id,
        event_id: event?.id,
        status: 'confirmed',
      })
      .select()
      .single();

    if (regError) {
      toast({ title: 'Error', description: regError.message, variant: 'destructive' });
      setIsProcessing(false);
      return;
    }

    // If paid event, create payment record
    if (!event?.is_free && regData) {
      await supabase.from('payments').insert({
        registration_id: regData.id,
        user_id: user?.id,
        amount: event?.base_price || 0,
        status: 'completed',
        payment_method: 'mock',
        paid_at: new Date().toISOString(),
      });
    }

    setIsProcessing(false);
    setShowPaymentDialog(false);
    setRegistrationComplete(true);
    setIsRegistered(true);
    
    toast({ title: 'Success!', description: 'You have successfully registered for this event!' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
      </div>
    );
  }

  if (!event) return null;

  const defaultBanner = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=60';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="relative h-64 md:h-96">
          <img
            src={event.banner_url || defaultBanner}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <Button
            variant="ghost"
            className="absolute top-4 left-4 text-white hover:bg-white/20"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
          </Button>
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                    {event.is_featured && (
                      <Badge className="bg-secondary text-secondary-foreground">Featured</Badge>
                    )}
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
                  
                  <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-secondary" />
                      <span>{format(new Date(event.start_date), 'MMM dd, yyyy')} - {format(new Date(event.end_date), 'MMM dd, yyyy')}</span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-secondary" />
                        <span>{event.venue}, {event.city}</span>
                      </div>
                    )}
                    {event.max_participants && (
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-secondary" />
                        <span>{event.max_participants} spots available</span>
                      </div>
                    )}
                  </div>

                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-3">About This Event</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {event.description || event.short_description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* College Info */}
              {event.college && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Organized By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        {event.college.logo_url ? (
                          <img src={event.college.logo_url} alt={event.college.name} className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">
                            {event.college.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{event.college.name}</h4>
                        <p className="text-sm text-muted-foreground">{event.college.city}, {event.college.state}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Registration */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Register Now</CardTitle>
                  <CardDescription>
                    {event.registration_deadline && (
                      <span className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4" />
                        Deadline: {format(new Date(event.registration_deadline), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-muted-foreground">Entry Fee</span>
                    <span className="text-2xl font-bold">
                      {event.is_free ? (
                        <Badge className="bg-green-500 text-white text-lg px-3 py-1">FREE</Badge>
                      ) : (
                        <span className="flex items-center">
                          <IndianRupee className="h-5 w-5" />
                          {event.base_price}
                        </span>
                      )}
                    </span>
                  </div>

                  {isRegistered || registrationComplete ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="font-semibold text-green-600">You're Registered!</p>
                      <p className="text-sm text-muted-foreground">Check your email for details</p>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-secondary hover:bg-secondary/90" 
                      size="lg"
                      onClick={handleRegister}
                    >
                      {event.is_free ? 'Register for Free' : `Pay ₹${event.base_price} & Register`}
                    </Button>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    By registering, you agree to the event's terms and conditions
                  </p>

                  <div className="pt-2 border-t">
                    <InquiryFormDialog 
                      eventId={event.id} 
                      targetName={event.title}
                      targetType="event"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Pay ₹{event.base_price} to register for {event.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Event Registration</span>
                  <span className="font-semibold">₹{event.base_price}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">₹{event.base_price}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Card Number (Demo)</Label>
                <Input placeholder="4242 4242 4242 4242" disabled value="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Expiry</Label>
                    <Input placeholder="12/26" disabled value="12/26" />
                  </div>
                  <div>
                    <Label>CVC</Label>
                    <Input placeholder="123" disabled value="123" />
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                🔒 This is a demo payment. No real charges will be made.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-secondary hover:bg-secondary/90"
                onClick={processRegistration}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${event.base_price}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
