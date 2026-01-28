import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Briefcase, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import evntgoLogo from '@/assets/evntgo-logo.jpeg';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative hero-gradient text-primary-foreground overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-secondary blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src={evntgoLogo} 
              alt="EvntGo" 
              className="h-24 md:h-32 w-auto rounded-2xl shadow-2xl animate-fade-in"
            />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Where Students Connect to{' '}
            <span className="gradient-text">Opportunity</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Discover college events, hackathons, jobs, and internships. 
            Your gateway to career opportunities and campus experiences.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search events, jobs, hackathons..."
                className="pl-10 h-12 bg-background text-foreground"
              />
            </div>
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 h-12 px-8">
              Explore
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">500+</div>
              <div className="text-sm text-primary-foreground/70">Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-1">100+</div>
              <div className="text-sm text-primary-foreground/70">Colleges</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">1K+</div>
              <div className="text-sm text-primary-foreground/70">Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-1">50K+</div>
              <div className="text-sm text-primary-foreground/70">Students</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div 
            onClick={() => navigate('/events')}
            className="bg-card/10 backdrop-blur-lg rounded-xl p-6 cursor-pointer hover:bg-card/20 transition-all group"
          >
            <Calendar className="h-10 w-10 text-secondary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2">College Events</h3>
            <p className="text-sm text-primary-foreground/70">
              Explore fests, workshops, seminars & competitions
            </p>
          </div>
          <div 
            onClick={() => navigate('/hackathons')}
            className="bg-card/10 backdrop-blur-lg rounded-xl p-6 cursor-pointer hover:bg-card/20 transition-all group"
          >
            <Trophy className="h-10 w-10 text-accent mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2">Hackathons</h3>
            <p className="text-sm text-primary-foreground/70">
              Build, compete & win exciting prizes
            </p>
          </div>
          <div 
            onClick={() => navigate('/jobs')}
            className="bg-card/10 backdrop-blur-lg rounded-xl p-6 cursor-pointer hover:bg-card/20 transition-all group"
          >
            <Briefcase className="h-10 w-10 text-secondary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold mb-2">Jobs & Internships</h3>
            <p className="text-sm text-primary-foreground/70">
              Find your dream career opportunity
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
