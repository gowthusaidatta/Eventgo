import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserCheck, UserX, Search, Building2, GraduationCap, Briefcase } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  college_name?: string;
  skills?: string[];
}

interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profile?: UserProfile;
}

interface College {
  id: string;
  name: string;
  logo_url?: string;
  city?: string;
  is_verified: boolean;
}

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  industry?: string;
  is_verified: boolean;
}

export default function Connections() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchStudents(),
      fetchColleges(),
      fetchCompanies(),
      fetchConnections(),
      fetchPendingRequests(),
    ]);
    setIsLoading(false);
  };

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user?.id)
      .eq('is_active', true);
    
    if (data) setStudents(data as UserProfile[]);
  };

  const fetchColleges = async () => {
    const { data } = await supabase
      .from('colleges')
      .select('*')
      .eq('is_active', true);
    
    if (data) setColleges(data);
  };

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('is_active', true);
    
    if (data) setCompanies(data);
  };

  const fetchConnections = async () => {
    const { data } = await supabase
      .from('connections')
      .select('*')
      .or(`requester_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
      .eq('status', 'accepted');
    
    if (data) setConnections(data as Connection[]);
  };

  const fetchPendingRequests = async () => {
    const { data } = await supabase
      .from('connections')
      .select('*')
      .eq('receiver_id', user?.id)
      .eq('status', 'pending');
    
    if (data) setPendingRequests(data as Connection[]);
  };

  const sendConnectionRequest = async (receiverId: string) => {
    const { error } = await supabase.from('connections').insert({
      requester_id: user?.id,
      receiver_id: receiverId,
      status: 'pending',
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Request Sent', description: 'Connection request sent successfully!' });
      fetchData();
    }
  };

  const respondToRequest = async (connectionId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('connections')
      .update({ status })
      .eq('id', connectionId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ 
        title: status === 'accepted' ? 'Connected!' : 'Request Declined',
        description: status === 'accepted' ? 'You are now connected!' : 'Connection request declined.'
      });
      fetchData();
    }
  };

  const isConnected = (userId: string) => {
    return connections.some(
      c => (c.requester_id === userId || c.receiver_id === userId)
    );
  };

  const hasPendingRequest = (userId: string) => {
    return connections.some(c => 
      (c.requester_id === user?.id && c.receiver_id === userId) ||
      (c.receiver_id === user?.id && c.requester_id === userId)
    );
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.college_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8 text-secondary" />
                Connections
              </h1>
              <p className="text-muted-foreground">Connect with students, colleges, and companies</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, college, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <Card className="mb-8 border-secondary">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-secondary" />
                  Pending Requests ({pendingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">New connection request</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => respondToRequest(request.id, 'accepted')}
                        >
                          <UserCheck className="h-4 w-4 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => respondToRequest(request.id, 'rejected')}
                        >
                          <UserX className="h-4 w-4 mr-1" /> Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="students" className="space-y-6">
            <TabsList>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Students ({filteredStudents.length})
              </TabsTrigger>
              <TabsTrigger value="colleges" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Colleges ({filteredColleges.length})
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Companies ({filteredCompanies.length})
              </TabsTrigger>
            </TabsList>

            {/* Students Tab */}
            <TabsContent value="students">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar_url} />
                          <AvatarFallback>{student.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{student.full_name}</h3>
                          {student.college_name && (
                            <p className="text-sm text-muted-foreground truncate">{student.college_name}</p>
                          )}
                          {student.skills && student.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {student.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        {isConnected(student.user_id) ? (
                          <Button variant="outline" className="w-full" disabled>
                            <UserCheck className="h-4 w-4 mr-2" /> Connected
                          </Button>
                        ) : hasPendingRequest(student.user_id) ? (
                          <Button variant="outline" className="w-full" disabled>
                            Pending...
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-secondary hover:bg-secondary/90"
                            onClick={() => sendConnectionRequest(student.user_id)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" /> Connect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredStudents.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    No students found
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Colleges Tab */}
            <TabsContent value="colleges">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredColleges.map((college) => (
                  <Card key={college.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          {college.logo_url ? (
                            <img src={college.logo_url} alt={college.name} className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{college.name}</h3>
                            {college.is_verified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          {college.city && (
                            <p className="text-sm text-muted-foreground">{college.city}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        View Events
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {filteredColleges.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    No colleges found
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Companies Tab */}
            <TabsContent value="companies">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanies.map((company) => (
                  <Card key={company.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          {company.logo_url ? (
                            <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            <Briefcase className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{company.name}</h3>
                            {company.is_verified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          {company.industry && (
                            <p className="text-sm text-muted-foreground">{company.industry}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        View Opportunities
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {filteredCompanies.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">
                    No companies found
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
