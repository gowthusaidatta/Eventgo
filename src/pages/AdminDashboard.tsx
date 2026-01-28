import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Briefcase, Building2, Shield, Search, Ban, CheckCircle, Trash2, Eye } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { user, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (!isLoading && (!user || role !== 'admin')) {
      toast({ title: 'Access Denied', description: 'Admin access required', variant: 'destructive' });
      navigate('/');
    }
  }, [user, role, isLoading, navigate]);

  useEffect(() => {
    if (role === 'admin') {
      fetchAllData();
    }
  }, [role]);

  const fetchAllData = async () => {
    // Fetch users with roles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesData) {
      // Get roles for each user
      const usersWithRoles = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id)
            .maybeSingle();
          return { ...profile, role: roleData?.role };
        })
      );
      setUsers(usersWithRoles);
    }

    // Fetch events
    const { data: eventsData } = await supabase
      .from('events')
      .select('*, college:colleges(name)')
      .order('created_at', { ascending: false });
    setEvents(eventsData || []);

    // Fetch opportunities
    const { data: oppsData } = await supabase
      .from('opportunities')
      .select('*, company:companies(name)')
      .order('created_at', { ascending: false });
    setOpportunities(oppsData || []);

    // Fetch colleges
    const { data: collegesData } = await supabase
      .from('colleges')
      .select('*')
      .order('created_at', { ascending: false });
    setColleges(collegesData || []);

    // Fetch companies
    const { data: companiesData } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    setCompanies(companiesData || []);
  };

  const handleVerifyCollege = async (collegeId: string, isVerified: boolean) => {
    const { error } = await supabase
      .from('colleges')
      .update({ is_verified: !isVerified })
      .eq('id', collegeId);
    
    if (!error) {
      toast({ title: 'Updated', description: `College ${!isVerified ? 'verified' : 'unverified'}` });
      fetchAllData();
    }
  };

  const handleVerifyCompany = async (companyId: string, isVerified: boolean) => {
    const { error } = await supabase
      .from('companies')
      .update({ is_verified: !isVerified })
      .eq('id', companyId);
    
    if (!error) {
      toast({ title: 'Updated', description: `Company ${!isVerified ? 'verified' : 'unverified'}` });
      fetchAllData();
    }
  };

  const handleToggleUserActive = async (userId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !isActive })
      .eq('user_id', userId);
    
    if (!error) {
      toast({ title: 'Updated', description: `User ${!isActive ? 'activated' : 'deactivated'}` });
      fetchAllData();
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (!error) {
      toast({ title: 'Deleted', description: 'Event deleted' });
      fetchAllData();
    }
  };

  const handleDeleteOpportunity = async (oppId: string) => {
    const { error } = await supabase.from('opportunities').delete().eq('id', oppId);
    if (!error) {
      toast({ title: 'Deleted', description: 'Opportunity deleted' });
      fetchAllData();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-secondary' },
    { label: 'Events', value: events.length, icon: Calendar, color: 'text-accent' },
    { label: 'Opportunities', value: opportunities.length, icon: Briefcase, color: 'text-secondary' },
    { label: 'Organizations', value: colleges.length + companies.length, icon: Building2, color: 'text-accent' },
  ];

  const roleColors: Record<string, string> = {
    student: 'bg-accent text-accent-foreground',
    college: 'bg-secondary text-secondary-foreground',
    company: 'bg-primary text-primary-foreground',
    admin: 'bg-destructive text-destructive-foreground',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-secondary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, events, and opportunities</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Platform Management</CardTitle>
                  <CardDescription>View and manage all platform data</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
                  <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
                  <TabsTrigger value="opportunities">Opportunities ({opportunities.length})</TabsTrigger>
                  <TabsTrigger value="colleges">Colleges ({colleges.length})</TabsTrigger>
                  <TabsTrigger value="companies">Companies ({companies.length})</TabsTrigger>
                </TabsList>

                {/* Users Tab */}
                <TabsContent value="users">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter(u => u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.avatar_url} />
                                <AvatarFallback>{u.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{u.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge className={roleColors[u.role] || 'bg-muted'}>
                              {u.role || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.is_active ? 'default' : 'secondary'}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDistanceToNow(new Date(u.created_at))} ago
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUserActive(u.user_id, u.is_active)}
                            >
                              {u.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Events Tab */}
                <TabsContent value="events">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events
                        .filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{e.title}</TableCell>
                          <TableCell>{e.college?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={e.status === 'published' ? 'default' : 'secondary'}>
                              {e.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{e.view_count}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDistanceToNow(new Date(e.created_at))} ago
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/events/${e.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDeleteEvent(e.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Opportunities Tab */}
                <TabsContent value="opportunities">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opportunities
                        .filter(o => o.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{o.title}</TableCell>
                          <TableCell>{o.company?.name || o.external_source || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{o.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={o.is_active ? 'default' : 'secondary'}>
                              {o.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{o.view_count}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteOpportunity(o.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Colleges Tab */}
                <TabsContent value="colleges">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>College</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {colleges
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.city || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={c.is_verified ? 'default' : 'secondary'}>
                              {c.is_verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.is_active ? 'default' : 'secondary'}>
                              {c.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerifyCollege(c.id, c.is_verified)}
                            >
                              {c.is_verified ? 'Unverify' : 'Verify'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Companies Tab */}
                <TabsContent value="companies">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.industry || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={c.is_verified ? 'default' : 'secondary'}>
                              {c.is_verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={c.is_active ? 'default' : 'secondary'}>
                              {c.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerifyCompany(c.id, c.is_verified)}
                            >
                              {c.is_verified ? 'Unverify' : 'Verify'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
