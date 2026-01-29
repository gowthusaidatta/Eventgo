import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Clock, ExternalLink, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Opportunity } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const navigate = useNavigate();

  const typeColors: Record<string, string> = {
    job: 'bg-accent text-accent-foreground',
    internship: 'bg-secondary text-secondary-foreground',
    hackathon: 'bg-primary text-primary-foreground',
    competition: 'bg-gold text-foreground',
  };

  const formatSalary = () => {
    if (!opportunity.salary_min && !opportunity.salary_max) return null;
    const min = opportunity.salary_min ? `₹${(opportunity.salary_min / 100000).toFixed(1)}L` : '';
    const max = opportunity.salary_max ? `₹${(opportunity.salary_max / 100000).toFixed(1)}L` : '';
    if (min && max) return `${min} - ${max}`;
    return min || max;
  };

  const handleClick = () => {
    if (opportunity.is_external && opportunity.external_url) {
      window.open(opportunity.external_url, '_blank');
    } else {
      navigate(`/opportunities/${opportunity.id}`);
    }
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (opportunity.is_external && opportunity.external_url) {
      window.open(opportunity.external_url, '_blank');
    } else {
      navigate(`/opportunities/${opportunity.id}`);
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer"
      onClick={handleClick}
    >
      {/* Image Banner */}
      {opportunity.image_url && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={opportunity.image_url}
            alt={opportunity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {opportunity.is_featured && (
            <Badge className="absolute top-3 left-3 bg-gold text-foreground">
              Featured
            </Badge>
          )}
        </div>
      )}
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={typeColors[opportunity.type]}>
                {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
              </Badge>
              {opportunity.is_remote && (
                <Badge variant="outline">Remote</Badge>
              )}
              {!opportunity.image_url && opportunity.is_featured && (
                <Badge className="bg-gold text-foreground">Featured</Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-secondary transition-colors">
              {opportunity.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {opportunity.company?.name || opportunity.external_source || 'Unknown Company'}
            </p>
          </div>
          {!opportunity.image_url && opportunity.company?.logo_url && (
            <img
              src={opportunity.company.logo_url}
              alt={opportunity.company.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {opportunity.description}
        </p>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {opportunity.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-secondary" />
              <span>{opportunity.location}</span>
            </div>
          )}
          {opportunity.experience_level && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-secondary" />
              <span>{opportunity.experience_level}</span>
            </div>
          )}
          {formatSalary() && (
            <div className="flex items-center gap-1.5">
              <IndianRupee className="h-4 w-4 text-secondary" />
              <span>{formatSalary()}</span>
            </div>
          )}
        </div>

        {opportunity.skills_required && opportunity.skills_required.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {opportunity.skills_required.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {opportunity.skills_required.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{opportunity.skills_required.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {opportunity.deadline ? (
            <span>Closes {format(new Date(opportunity.deadline), 'MMM dd')}</span>
          ) : (
            <span>Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago</span>
          )}
        </div>
        <Button size="sm" className="bg-secondary hover:bg-secondary/90" onClick={handleApply}>
          {opportunity.is_external ? (
            <>
              Apply <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </>
          ) : (
            'View Details'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
