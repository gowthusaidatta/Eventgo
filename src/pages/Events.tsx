import { useEffect, useState } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EventCard } from '@/components/cards/EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

// Sample events
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
  {
    id: '4',
    college_id: '4',
    title: 'AI & ML Workshop Series',
    short_description: 'Learn AI and Machine Learning from industry experts in this 3-day workshop.',
    banner_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60',
    venue: 'Tech Hub',
    city: 'Hyderabad',
    start_date: '2026-03-10T09:00:00Z',
    end_date: '2026-03-12T17:00:00Z',
    is_free: false,
    base_price: 499,
    status: 'published',
    tags: ['AI', 'ML', 'Workshop'],
    is_featured: false,
    view_count: 650,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    college_id: '5',
    title: 'Sports Meet 2026',
    short_description: 'Inter-college sports competition with 15+ sports categories.',
    banner_url: 'https://images.unsplash.com/photo-1461896836934- voices%20-in-sports?w=800&auto=format&fit=crop&q=60',
    venue: 'Sports Complex',
    city: 'Chennai',
    start_date: '2026-02-25T08:00:00Z',
    end_date: '2026-02-28T18:00:00Z',
    is_free: true,
    base_price: 0,
    status: 'published',
    tags: ['Sports', 'Athletics', 'Competition'],
    is_featured: false,
    view_count: 420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    college_id: '6',
    title: 'Design Thinking Bootcamp',
    short_description: 'Master design thinking methodology in this intensive 2-day bootcamp.',
    banner_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60',
    venue: 'Innovation Lab',
    city: 'Pune',
    start_date: '2026-03-05T09:00:00Z',
    end_date: '2026-03-06T18:00:00Z',
    is_free: false,
    base_price: 399,
    status: 'published',
    tags: ['Design', 'UX', 'Innovation'],
    is_featured: false,
    view_count: 380,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const popularTags = ['Tech', 'Cultural', 'Workshop', 'Coding', 'Music', 'Sports', 'Innovation'];

export default function Events() {
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, college:colleges(*)')
        .eq('status', 'published')
        .order('start_date', { ascending: true });

      if (!error && data && data.length > 0) {
        setEvents(data as unknown as Event[]);
      }
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => event.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="hero-gradient text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <h1 className="text-4xl font-bold mb-4">Discover Events</h1>
              <p className="text-primary-foreground/80 mb-8">
                Explore college fests, workshops, seminars, and competitions near you
              </p>
              
              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search events by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-background text-foreground"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            {/* Tags Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {popularTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-secondary/20"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTags([])}
                  className="text-muted-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
