import { useEffect, useState } from 'react';
import { Search, Briefcase, MapPin } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Opportunity } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

// Sample jobs
const sampleJobs: Opportunity[] = [
  {
    id: 'j1',
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
    id: 'j2',
    title: 'Backend Engineer',
    type: 'job',
    description: 'Design and implement scalable backend services. Experience with microservices architecture required.',
    location: 'Bangalore',
    is_remote: true,
    salary_min: 1200000,
    salary_max: 2000000,
    salary_currency: 'INR',
    skills_required: ['Java', 'Spring Boot', 'Kubernetes', 'MongoDB'],
    experience_level: '2-5 Years',
    is_active: true,
    is_featured: true,
    view_count: 450,
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: '3',
      user_id: '3',
      name: 'TechCorp India',
      logo_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop',
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'j3',
    title: 'Product Designer',
    type: 'job',
    description: 'Create beautiful and intuitive user experiences. Lead design for mobile and web products.',
    location: 'Delhi NCR',
    is_remote: true,
    salary_min: 1000000,
    salary_max: 1800000,
    salary_currency: 'INR',
    skills_required: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'],
    experience_level: '2-4 Years',
    is_active: true,
    is_featured: false,
    view_count: 280,
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
    id: 'j4',
    title: 'Data Analyst',
    type: 'job',
    description: 'Analyze data to drive business decisions. Build dashboards and reporting systems.',
    location: 'Hyderabad',
    is_remote: false,
    salary_min: 600000,
    salary_max: 1000000,
    salary_currency: 'INR',
    skills_required: ['SQL', 'Python', 'Tableau', 'Excel'],
    experience_level: '0-2 Years',
    is_active: true,
    is_featured: false,
    view_count: 190,
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: {
      id: '5',
      user_id: '5',
      name: 'DataMinds AI',
      is_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'j5',
    title: 'DevOps Engineer',
    type: 'job',
    description: 'Build and maintain CI/CD pipelines. Manage cloud infrastructure on AWS/GCP.',
    location: 'Pune',
    is_remote: true,
    salary_min: 1400000,
    salary_max: 2200000,
    salary_currency: 'INR',
    skills_required: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
    experience_level: '3-5 Years',
    is_active: true,
    is_featured: false,
    view_count: 350,
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
];

const locations = ['All Locations', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'];
const experienceLevels = ['All Experience', 'Fresher', '0-2 Years', '1-3 Years', '2-5 Years', '3-5 Years'];

export default function Jobs() {
  const [jobs, setJobs] = useState<Opportunity[]>(sampleJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*, company:companies(*)')
        .eq('type', 'job')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setJobs(data as unknown as Opportunity[]);
      }
      setIsLoading(false);
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'All Locations' || 
      job.location?.includes(selectedLocation);
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="hero-gradient text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <h1 className="text-4xl font-bold mb-4">Find Your Dream Job</h1>
              <p className="text-primary-foreground/80 mb-8">
                Browse job opportunities from top companies across India
              </p>
              
              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title or company..."
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
            {/* Location Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              {locations.map(location => (
                <Badge
                  key={location}
                  variant={selectedLocation === location ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-secondary/20"
                  onClick={() => setSelectedLocation(location)}
                >
                  {location}
                </Badge>
              ))}
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map(job => (
                <OpportunityCard key={job.id} opportunity={job} />
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No jobs found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
