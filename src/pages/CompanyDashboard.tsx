import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Users, Eye, Trash2, Edit, MessageSquare } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity, OpportunityType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { InquiriesInbox } from '@/components/InquiriesInbox';

export default function CompanyDashboard() {
  const { user, profile, role, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'job' as OpportunityType,
    description: '',
    requirements: '',
    location: '',
    is_remote: false,
    salary_min: '',
    salary_max: '',
    skills_required: '',
    experience_level: '',
    deadline: '',
  });

  useEffect(() => {
    if (!isLoading && (!user || role !== 'company')) {
      navigate('/login');
    }
  }, [user, role, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    // Fetch company
    const { data: companyData } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    setCompany(companyData);

    if (companyData) {
      // Fetch opportunities
      const { data: oppsData } = await supabase
        .from('opportunities')
        .select('*')
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false });
      
      setOpportunities((oppsData as unknown as Opportunity[]) || []);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    
    setIsSubmitting(true);

    const { error } = await supabase
      .from('opportunities')
      .insert({
        company_id: company.id,
        title: formData.title,
        type: formData.type,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        is_remote: formData.is_remote,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        skills_required: formData.skills_required.split(',').map(s => s.trim()).filter(Boolean),
        experience_level: formData.experience_level,
        deadline: formData.deadline || null,
        is_active: true,
      });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Opportunity created successfully!' });
      setIsDialogOpen(false);
      setFormData({
        title: '',
        type: 'job',
        description: '',
        requirements: '',
        location: '',
        is_remote: false,
        salary_min: '',
        salary_max: '',
        skills_required: '',
        experience_level: '',
        deadline: '',
      });
      fetchCompanyData();
    }
    setIsSubmitting(false);
  };

  const handleDeleteOpportunity = async (oppId: string) => {
    const { error } = await supabase.from('opportunities').delete().eq('id', oppId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Opportunity deleted successfully' });
      fetchCompanyData();
    }
  };

  const handleToggleActive = async (oppId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('opportunities')
      .update({ is_active: !currentActive })
      .eq('id', oppId);
    
    if (!error) {
      toast({ title: 'Updated', description: `Opportunity ${!currentActive ? 'activated' : 'deactivated'}` });
      fetchCompanyData();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
      </div>
    );
  }

  const filteredOpps = activeTab === 'all' 
    ? opportunities 
    : opportunities.filter(o => o.type === activeTab);

  const stats = [
    { label: 'Total Listings', value: opportunities.length, icon: Briefcase },
    { label: 'Active', value: opportunities.filter(o => o.is_active).length, icon: Eye },
    { label: 'Applications', value: '0', icon: Users },
  ];

  const typeColors: Record<string, string> = {
    job: 'bg-accent text-accent-foreground',
    internship: 'bg-secondary text-secondary-foreground',
    hackathon: 'bg-primary text-primary-foreground',
    competition: 'bg-gold text-foreground',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Company Dashboard</h1>
              <p className="text-muted-foreground">{company?.name || 'Manage your opportunities'}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-secondary hover:bg-secondary/90">
                  <Plus className="h-4 w-4 mr-2" /> Post Opportunity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post New Opportunity</DialogTitle>
                  <DialogDescription>Create a job or internship posting</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateOpportunity} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Full Stack Developer"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: OpportunityType) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="job">Job</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="hackathon">Hackathon</SelectItem>
                          <SelectItem value="competition">Competition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="experience_level">Experience Level</Label>
                      <Select
                        value={formData.experience_level}
                        onValueChange={(value) => setFormData({ ...formData, experience_level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Entry Level">Entry Level</SelectItem>
                          <SelectItem value="0-2 Years">0-2 Years</SelectItem>
                          <SelectItem value="1-3 Years">1-3 Years</SelectItem>
                          <SelectItem value="2-5 Years">2-5 Years</SelectItem>
                          <SelectItem value="5+ Years">5+ Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Job description..."
                        rows={4}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="requirements">Requirements</Label>
                      <Textarea
                        id="requirements"
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                        placeholder="Required qualifications..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Bangalore"
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-6">
                      <Switch
                        id="is_remote"
                        checked={formData.is_remote}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
                      />
                      <Label htmlFor="is_remote">Remote Friendly</Label>
                    </div>
                    <div>
                      <Label htmlFor="salary_min">Min Salary (₹ per year)</Label>
                      <Input
                        id="salary_min"
                        type="number"
                        value={formData.salary_min}
                        onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                        placeholder="600000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salary_max">Max Salary (₹ per year)</Label>
                      <Input
                        id="salary_max"
                        type="number"
                        value={formData.salary_max}
                        onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                        placeholder="1200000"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="skills_required">Required Skills (comma-separated)</Label>
                      <Input
                        id="skills_required"
                        value={formData.skills_required}
                        onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
                        placeholder="React, Node.js, PostgreSQL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-secondary hover:bg-secondary/90">
                      {isSubmitting ? 'Posting...' : 'Post Opportunity'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-secondary" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Opportunities List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription>Manage all your job and internship postings</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="job">Jobs</TabsTrigger>
                  <TabsTrigger value="internship">Internships</TabsTrigger>
                  <TabsTrigger value="inquiries" className="gap-1">
                    <MessageSquare className="h-4 w-4" /> Inquiries
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <OpportunityList opps={filteredOpps} />
                </TabsContent>
                <TabsContent value="job" className="mt-4">
                  <OpportunityList opps={filteredOpps} />
                </TabsContent>
                <TabsContent value="internship" className="mt-4">
                  <OpportunityList opps={filteredOpps} />
                </TabsContent>
                <TabsContent value="inquiries" className="mt-4">
                  <InquiriesInbox type="company" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );

  function OpportunityList({ opps }: { opps: Opportunity[] }) {
    if (opps.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No opportunities yet. Post your first listing!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {opps.map((opp) => (
          <div
            key={opp.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{opp.title}</h3>
                <Badge className={typeColors[opp.type]}>
                  {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
                </Badge>
                {!opp.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                {opp.is_remote && (
                  <Badge variant="outline">Remote</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {opp.location || 'Location TBD'} • Posted {formatDistanceToNow(new Date(opp.created_at))} ago
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(opp.id, opp.is_active)}
              >
                {opp.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeleteOpportunity(opp.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
