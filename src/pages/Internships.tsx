import { useEffect, useState } from 'react';
import { Search, GraduationCap, Clock } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Opportunity } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

// Sample internships
const sampleInternships: Opportunity[] = [
  {
    id: 'i1',
    title: 'Software Engineer Intern',
    type: 'internship',
    description: 'Join our engineering team to work on cutting-edge products. Learn from experienced engineers and contribute to real projects.',
    location: 'Bangalore',
    is_remote: true,
    salary_min: 25000,
    salary_max: 40000,
    salary_currency: 'INR',
    skills_required: ['React', 'TypeScript', 'Node.js'],
    experience_level: 'Entry Level',
    is_active: true,
    is_featured: true,
    view_count: 450,
    deadline: '2026-02-28T23:59:59Z',
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: '1',
      user_id: '1',
      name: 'TechCorp India',
      logo_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop',
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'i2',
    title: 'Data Science Intern',
    type: 'internship',
    description: 'Work on ML models and data pipelines. Great opportunity to learn from industry experts.',
    location: 'Hyderabad',
    is_remote: true,
    salary_min: 30000,
    salary_max: 50000,
    salary_currency: 'INR',
    skills_required: ['Python', 'ML', 'SQL', 'TensorFlow'],
    experience_level: 'Entry Level',
    is_active: true,
    is_featured: true,
    view_count: 280,
    deadline: '2026-02-15T23:59:59Z',
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: '3',
      user_id: '3',
      name: 'DataMinds AI',
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'i3',
    title: 'Product Design Intern',
    type: 'internship',
    description: 'Learn product design from scratch. Work on real products used by millions of users.',
    location: 'Mumbai',
    is_remote: false,
    salary_min: 20000,
    salary_max: 35000,
    salary_currency: 'INR',
    skills_required: ['Figma', 'UI Design', 'Prototyping'],
    experience_level: 'Entry Level',
    is_active: true,
    is_featured: false,
    view_count: 180,
    deadline: '2026-03-01T23:59:59Z',
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: '4',
      user_id: '4',
      name: 'DesignLab',
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'i4',
    title: 'Marketing Intern',
    type: 'internship',
    description: 'Work on digital marketing campaigns. Learn SEO, content marketing, and social media.',
    location: 'Delhi NCR',
    is_remote: true,
    salary_min: 15000,
    salary_max: 25000,
    salary_currency: 'INR',
    skills_required: ['Digital Marketing', 'SEO', 'Content Writing'],
    experience_level: 'Entry Level',
    is_active: true,
    is_featured: false,
    view_count: 150,
    deadline: '2026-02-20T23:59:59Z',
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: '5',
      user_id: '5',
      name: 'GrowthHackers',
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'i5',
    title: 'Backend Developer Intern',
    type: 'internship',
    description: 'Build APIs and backend services. Work with Node.js, PostgreSQL, and Redis.',
    location: 'Pune',
    is_remote: true,
    salary_min: 25000,
    salary_max: 40000,
    salary_currency: 'INR',
    skills_required: ['Node.js', 'PostgreSQL', 'REST APIs'],
    experience_level: 'Entry Level',
    is_active: true,
    is_featured: false,
    view_count: 220,
    deadline: '2026-03-10T23:59:59Z',
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: '6',
      user_id: '6',
      name: 'CloudScale',
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'i6',
    title: 'Finance Intern',
    type: 'internship',
    description: 'Learn financial analysis, modeling, and reporting. Great for commerce students.',
    location: 'Chennai',
    is_remote: false,
    salary_min: 18000,
    salary_max: 28000,
    salary_currency: 'INR',
    skills_required: ['Excel', 'Financial Modeling', 'Accounting'],
    experience_level: 'Entry Level',
    is_active: true,
    is_featured: false,
    view_count: 120,
    deadline: '2026-02-25T23:59:59Z',
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: '7',
      user_id: '7',
      name: 'FinTech Solutions',
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
];

const durations = ['All Durations', '1-2 Months', '3-4 Months', '5-6 Months', '6+ Months'];

export default function Internships() {
  const [internships, setInternships] = useState<Opportunity[]>(sampleInternships);
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInternships = async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*, company:companies(*)')
        .eq('type', 'internship')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setInternships(data as unknown as Opportunity[]);
      }
      setIsLoading(false);
    };

    fetchInternships();
  }, []);

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.company?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRemote = !remoteOnly || internship.is_remote;
    return matchesSearch && matchesRemote;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="hero-gradient text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <h1 className="text-4xl font-bold mb-4">Find Internships</h1>
              <p className="text-primary-foreground/80 mb-8">
                Kickstart your career with internships at top companies
              </p>
              
              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search internships..."
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
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Badge
                variant={remoteOnly ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-secondary/20"
                onClick={() => setRemoteOnly(!remoteOnly)}
              >
                <Clock className="h-3 w-3 mr-1" />
                Work from Home
              </Badge>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInternships.map(internship => (
                <OpportunityCard key={internship.id} opportunity={internship} />
              ))}
            </div>

            {filteredInternships.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No internships found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
