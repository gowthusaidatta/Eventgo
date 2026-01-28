import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event } from '@/lib/types';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const defaultBanner = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60';

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={event.banner_url || defaultBanner}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {event.is_featured && (
          <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">
            Featured
          </Badge>
        )}
        {!event.is_free && (
          <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
            <IndianRupee className="h-3 w-3 mr-1" />
            {event.base_price}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {event.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {event.short_description || event.description}
        </p>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-secondary" />
            <span>{format(new Date(event.start_date), 'MMM dd, yyyy')}</span>
          </div>
          {event.city && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              <span>{event.city}</span>
            </div>
          )}
          {event.max_participants && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" />
              <span>{event.max_participants} spots</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link to={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
