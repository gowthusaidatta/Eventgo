import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { Opportunity } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

// Sample opportunities
const sampleOpportunities: Opportunity[] = [
  {
    id: '1',
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
    id: '2',
    title: 'Full Stack Developer',
    type: 'job',
    description: 'Build and maintain web applications. Work with modern tech stack including React, Node.js, and PostgreSQL.',
    location: 'Mumbai',
    is_remote: false,
    salary_min: 800000,
    salary_max: 1500000,
    salary_currency: 'INR',
    skills_required: ['JavaScript', 'React', 'PostgreSQL', 'AWS'],
    experience_level: '1-3 Years',
    is_active: true,
    is_featured: true,
    view_count: 320,
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: '2',
      user_id: '2',
      name: 'StartupXYZ',
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: '3',
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
    id: '4',
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
];

export function FeaturedOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(sampleOpportunities);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*, company:companies(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        setOpportunities(data as unknown as Opportunity[]);
      }
      setIsLoading(false);
    };

    fetchOpportunities();
  }, []);

  const filteredOpportunities = activeTab === 'all' 
    ? opportunities 
    : opportunities.filter(o => o.type === activeTab);

  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Opportunities</h2>
            <p className="text-muted-foreground">Jobs, internships & hackathons for you</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-card">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="job">Jobs</TabsTrigger>
            <TabsTrigger value="internship">Internships</TabsTrigger>
            <TabsTrigger value="hackathon">Hackathons</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOpportunities.slice(0, 4).map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link to="/jobs">
              Browse Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild className="bg-secondary hover:bg-secondary/90">
            <Link to="/hackathons">
              View Hackathons <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
