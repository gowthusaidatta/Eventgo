import { useEffect, useState } from 'react';
import { Search, Trophy, ExternalLink } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Opportunity } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

// Sample hackathons
const sampleHackathons: Opportunity[] = [
  {
    id: 'h1',
    title: 'HackIndia 2026',
    type: 'hackathon',
    description: '48-hour national hackathon with prizes worth ₹10 Lakhs. Build solutions for real-world problems.',
    location: 'Delhi',
    is_remote: false,
    is_active: true,
    is_featured: true,
    view_count: 890,
    deadline: '2026-03-15T23:59:59Z',
    is_external: true,
    external_source: 'Unstop',
    external_url: 'https://unstop.com',
    skills_required: ['Problem Solving', 'Coding', 'Innovation'],
    experience_level: 'All Levels',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    salary_currency: 'INR',
  },
  {
    id: 'h2',
    title: 'Smart India Hackathon 2026',
    type: 'hackathon',
    description: 'India\'s biggest hackathon. Solve government challenges and win exciting prizes.',
    location: 'Multiple Cities',
    is_remote: false,
    is_active: true,
    is_featured: true,
    view_count: 2500,
    deadline: '2026-04-01T23:59:59Z',
    is_external: true,
    external_source: 'SIH',
    external_url: 'https://sih.gov.in',
    skills_required: ['Innovation', 'Development', 'Teamwork'],
    experience_level: 'All Levels',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    salary_currency: 'INR',
  },
  {
    id: 'h3',
    title: 'Web3 Builders Hackathon',
    type: 'hackathon',
    description: 'Build the future of decentralized web. $50K in prizes for best blockchain projects.',
    location: 'Bangalore',
    is_remote: true,
    is_active: true,
    is_featured: true,
    view_count: 650,
    deadline: '2026-02-28T23:59:59Z',
    is_external: false,
    skills_required: ['Blockchain', 'Smart Contracts', 'Web3'],
    experience_level: 'Intermediate',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    salary_currency: 'INR',
  },
  {
    id: 'h4',
    title: 'AI for Good Hackathon',
    type: 'hackathon',
    description: 'Use AI to solve social challenges. Healthcare, education, environment - pick your domain.',
    location: 'Mumbai',
    is_remote: true,
    is_active: true,
    is_featured: false,
    view_count: 420,
    deadline: '2026-03-20T23:59:59Z',
    is_external: true,
    external_source: 'Devfolio',
    external_url: 'https://devfolio.co',
    skills_required: ['AI/ML', 'Python', 'Data Science'],
    experience_level: 'All Levels',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    salary_currency: 'INR',
  },
  {
    id: 'h5',
    title: 'Climate Tech Challenge',
    type: 'competition',
    description: 'Build sustainable technology solutions to combat climate change.',
    location: 'Hyderabad',
    is_remote: false,
    is_active: true,
    is_featured: false,
    view_count: 310,
    deadline: '2026-03-25T23:59:59Z',
    is_external: false,
    skills_required: ['Sustainability', 'IoT', 'Green Tech'],
    experience_level: 'All Levels',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    salary_currency: 'INR',
  },
];

export default function Hackathons() {
  const [hackathons, setHackathons] = useState<Opportunity[]>(sampleHackathons);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHackathons = async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*, company:companies(*)')
        .in('type', ['hackathon', 'competition'])
        .eq('is_active', true)
        .order('deadline', { ascending: true });

      if (!error && data && data.length > 0) {
        setHackathons(data as unknown as Opportunity[]);
      }
      setIsLoading(false);
    };

    fetchHackathons();
  }, []);

  const filteredHackathons = hackathons.filter(h =>
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="hero-gradient text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <h1 className="text-4xl font-bold mb-4">Hackathons & Competitions</h1>
              <p className="text-primary-foreground/80 mb-8">
                Build, compete, and win. Join hackathons from top platforms like Unstop, Devfolio & more.
              </p>
              
              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search hackathons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-background text-foreground"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="outline" className="text-muted-foreground">
                <ExternalLink className="h-3 w-3 mr-1" />
                External hackathons from Unstop, Devfolio & more
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredHackathons.map(hackathon => (
                <OpportunityCard key={hackathon.id} opportunity={hackathon} />
              ))}
            </div>

            {filteredHackathons.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hackathons found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
