import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/cards/EventCard';
import { Event } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

// Sample events for initial display
const sampleEvents: Event[] = [
  {
    id: '1',
    college_id: '1',
    title: 'TechFest 2026 - Annual Technical Festival',
    short_description: 'Join the biggest tech fest with coding competitions, robotics, and more!',
    description: 'Annual technical festival featuring coding competitions, robotics, workshops, and guest lectures from industry experts.',
    banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
    venue: 'Main Campus',
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
    description: 'A two-day summit bringing together aspiring entrepreneurs, successful founders, and investors.',
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
    description: 'Annual cultural festival featuring performances, competitions, and celebrity appearances.',
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

export function FeaturedEvents() {
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, college:colleges(*)')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('start_date', { ascending: true })
        .limit(6);

      if (!error && data && data.length > 0) {
        setEvents(data as unknown as Event[]);
      }
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Events</h2>
            <p className="text-muted-foreground">Discover trending events from top colleges</p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link to="/events">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 6).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button asChild>
            <Link to="/events">
              View All Events <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
