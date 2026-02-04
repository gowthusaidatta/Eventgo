import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, Calendar, Users, Settings, BarChart3 } from 'lucide-react';

// Import logos as public assets
const adityaLogo = '/aditya-logo.svg';
const eventgoLogo = '/eventgo-logo.svg';

const COLLEGE_ROLE_LABELS: Record<string, string> = {
  principal: 'Principal',
  dean: 'Dean',
  coordinator: 'Coordinator',
  teaching_staff: 'Teaching Staff',
  staff_coordinator: 'Staff Coordinator',
};

export default function DashboardAditya() {
  const { user, profile, role, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || role !== 'college')) {
      navigate('/aditya/login');
    }
  }, [user, role, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/aditya');
  };

  const collegeRole = profile?.college_role as string || 'coordinator';
  const roleLabel = COLLEGE_ROLE_LABELS[collegeRole] || 'Staff';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={adityaLogo} alt="Aditya University" className="h-12 w-12" />
            <span className="font-bold text-lg text-blue-900">Aditya</span>
            <span className="text-gray-300 px-2">|</span>
            <img src={eventgoLogo} alt="EvntGo" className="h-12 w-12" />
            <span className="font-bold text-lg text-purple-600">EvntGo</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {roleLabel}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Card */}
        <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="text-3xl text-blue-900">Welcome, {profile?.full_name}!</CardTitle>
            <CardDescription className="text-blue-700">
              You are logged in as <span className="font-semibold">{roleLabel}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Manage campus events, track registrations, and engage with the student community using the EvntGo platform.
            </p>
          </CardContent>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: Calendar,
              title: 'Events',
              description: 'Manage campus events',
              count: '0',
              actionLabel: 'View Events',
            },
            {
              icon: Users,
              title: 'Registrations',
              description: 'Track event registrations',
              count: '0',
              actionLabel: 'View Registrations',
            },
            {
              icon: BarChart3,
              title: 'Analytics',
              description: 'Event performance metrics',
              count: '-',
              actionLabel: 'View Analytics',
            },
            {
              icon: Settings,
              title: 'Settings',
              description: 'Manage your profile',
              count: '-',
              actionLabel: 'Edit Profile',
            },
          ].map((item, idx) => (
            <Card key={idx} className="border-blue-100 hover:shadow-lg transition">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <item.icon className="h-8 w-8 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{item.count}</span>
                </div>
                <CardTitle className="text-lg mt-2">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 w-full">
                  {item.actionLabel}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start text-left bg-blue-50 text-blue-900 hover:bg-blue-100">
                <Calendar className="mr-2 h-4 w-4" />
                Create New Event
              </Button>
              <Button className="w-full justify-start text-left bg-blue-50 text-blue-900 hover:bg-blue-100">
                <Users className="mr-2 h-4 w-4" />
                View Registrations
              </Button>
              <Button className="w-full justify-start text-left bg-blue-50 text-blue-900 hover:bg-blue-100">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{profile?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-semibold text-blue-600">{roleLabel}</p>
              </div>
              {profile?.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{profile?.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2026 Aditya University × EvntGo. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-2">Powered by EvntGo Event Management Platform</p>
        </div>
      </footer>
    </div>
  );
}
