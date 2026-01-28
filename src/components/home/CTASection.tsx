import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function CTASection() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: GraduationCap,
      title: 'For Students',
      description: 'Discover events, apply for jobs, participate in hackathons, and connect with peers.',
      buttonText: 'Sign Up Free',
      onClick: () => navigate('/signup?role=student'),
      gradient: 'from-cyan to-accent',
    },
    {
      icon: Building2,
      title: 'For Colleges',
      description: 'Host events, manage registrations, and showcase your institution to thousands.',
      buttonText: 'Register College',
      onClick: () => navigate('/signup?role=college'),
      gradient: 'from-secondary to-coral-light',
    },
    {
      icon: Briefcase,
      title: 'For Companies',
      description: 'Post jobs, find top talent, sponsor hackathons, and build your employer brand.',
      buttonText: 'Register Company',
      onClick: () => navigate('/signup?role=company'),
      gradient: 'from-primary to-navy-light',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the EvntGo Community
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you're a student looking for opportunities, a college hosting events, 
            or a company hiring talent - EvntGo has you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cards.map((card) => (
            <Card 
              key={card.title}
              className="overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted group-hover:scale-110 transition-transform">
                  <card.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{card.description}</p>
                <Button 
                  onClick={card.onClick}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {card.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
