import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Briefcase, Users, Trophy, BookmarkCheck, Bell } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user, profile, role, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
      </div>
    );
  }

  const stats = [
    { label: 'Registered Events', value: '3', icon: Calendar, color: 'text-secondary' },
    { label: 'Applications', value: '5', icon: Briefcase, color: 'text-accent' },
    { label: 'Connections', value: '12', icon: Users, color: 'text-secondary' },
    { label: 'Achievements', value: '2', icon: Trophy, color: 'text-gold' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your opportunities
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-secondary" />
                  My Events
                </CardTitle>
                <CardDescription>Events you've registered for</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  You have 3 upcoming events this month
                </p>
                <Button onClick={() => navigate('/events')} variant="outline" className="w-full">
                  View Events
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookmarkCheck className="h-5 w-5 text-accent" />
                  Saved Opportunities
                </CardTitle>
                <CardDescription>Jobs & internships you saved</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  5 opportunities saved for later
                </p>
                <Button onClick={() => navigate('/jobs')} variant="outline" className="w-full">
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-secondary" />
                  Notifications
                </CardTitle>
                <CardDescription>Stay updated</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  2 new updates since your last visit
                </p>
                <Button variant="outline" className="w-full">
                  View All
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
