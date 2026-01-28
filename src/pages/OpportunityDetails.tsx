import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Clock, ExternalLink, IndianRupee, ArrowLeft, CheckCircle, Building2, Users } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Opportunity } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { InquiryFormDialog } from '@/components/InquiryFormDialog';

export default function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchOpportunityDetails();
  }, [id]);

  const fetchOpportunityDetails = async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*, company:companies(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      toast({ title: 'Error', description: 'Opportunity not found', variant: 'destructive' });
      navigate('/jobs');
      return;
    }

    setOpportunity(data as unknown as Opportunity);
    setIsLoading(false);
  };

  const handleApply = async () => {
    if (!user) {
      toast({ title: 'Login Required', description: 'Please login to apply' });
      navigate('/login');
      return;
    }

    if (opportunity?.is_external && opportunity?.external_url) {
      window.open(opportunity.external_url, '_blank');
      return;
    }

    setShowApplyDialog(true);
  };

  const submitApplication = async () => {
    setIsApplying(true);
    
    // In a real app, you'd save the application to a dedicated table
    // For now, we'll just show a success message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsApplying(false);
    setShowApplyDialog(false);
    setHasApplied(true);
    toast({ title: 'Application Submitted!', description: 'Your application has been sent to the company.' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
      </div>
    );
  }

  if (!opportunity) return null;

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
    if (min && max) return `${min} - ${max} per year`;
    return `${min || max} per year`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge className={typeColors[opportunity.type]}>
                          {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
                        </Badge>
                        {opportunity.is_remote && <Badge variant="outline">Remote</Badge>}
                        {opportunity.is_featured && <Badge className="bg-gold text-foreground">Featured</Badge>}
                      </div>
                      <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
                      <div className="flex items-center gap-2 text-lg text-muted-foreground">
                        <Building2 className="h-5 w-5" />
                        <span>{opportunity.company?.name || opportunity.external_source || 'Company'}</span>
                        {opportunity.company?.is_verified && (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        )}
                      </div>
                    </div>
                    {opportunity.company?.logo_url && (
                      <img
                        src={opportunity.company.logo_url}
                        alt={opportunity.company.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
                    {opportunity.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-secondary" />
                        <span>{opportunity.location}</span>
                      </div>
                    )}
                    {opportunity.experience_level && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-secondary" />
                        <span>{opportunity.experience_level}</span>
                      </div>
                    )}
                    {formatSalary() && (
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-5 w-5 text-secondary" />
                        <span>{formatSalary()}</span>
                      </div>
                    )}
                  </div>

                  {opportunity.skills_required && opportunity.skills_required.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.skills_required.map((skill) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About This Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {opportunity.description}
                  </p>
                </CardContent>
              </Card>

              {opportunity.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {opportunity.requirements}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Company Info */}
              {opportunity.company && (
                <Card>
                  <CardHeader>
                    <CardTitle>About the Company</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        {opportunity.company.logo_url ? (
                          <img src={opportunity.company.logo_url} alt={opportunity.company.name} className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {opportunity.company.name}
                          {opportunity.company.is_verified && <CheckCircle className="h-4 w-4 text-accent" />}
                        </h4>
                        <p className="text-sm text-muted-foreground">{opportunity.company.industry}</p>
                        {opportunity.company.headquarters && (
                          <p className="text-sm text-muted-foreground">{opportunity.company.headquarters}</p>
                        )}
                      </div>
                    </div>
                    {opportunity.company.description && (
                      <p className="text-muted-foreground">{opportunity.company.description}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Apply */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Apply Now</CardTitle>
                  <CardDescription>
                    {opportunity.deadline && (
                      <span className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4" />
                        Deadline: {format(new Date(opportunity.deadline), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      {opportunity.view_count} people viewed this
                    </p>
                    <p>Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago</p>
                  </div>

                  {hasApplied ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="font-semibold text-green-600">Application Submitted!</p>
                      <p className="text-sm text-muted-foreground">Good luck!</p>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-secondary hover:bg-secondary/90" 
                      size="lg"
                      onClick={handleApply}
                    >
                      {opportunity.is_external ? (
                        <>Apply on {opportunity.external_source} <ExternalLink className="ml-2 h-4 w-4" /></>
                      ) : (
                        'Apply Now'
                      )}
                    </Button>
                  )}
                  
                  <div className="pt-2 border-t">
                    <InquiryFormDialog 
                      opportunityId={opportunity.id} 
                      targetName={opportunity.title}
                      targetType="opportunity"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for {opportunity.title}</DialogTitle>
              <DialogDescription>
                at {opportunity.company?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Your Profile</Label>
                <div className="p-3 bg-muted rounded-lg mt-2">
                  <p className="font-medium">{profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  {profile?.college_name && (
                    <p className="text-sm text-muted-foreground">{profile.college_name}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="cover_letter">Cover Letter (Optional)</Label>
                <Textarea
                  id="cover_letter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're a great fit for this role..."
                  rows={5}
                  className="mt-2"
                />
              </div>
              
              {profile?.resume_url && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Resume attached</p>
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="text-sm text-secondary hover:underline">
                    View Resume
                  </a>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-secondary hover:bg-secondary/90"
                onClick={submitApplication}
                disabled={isApplying}
              >
                {isApplying ? 'Submitting...' : 'Submit Application'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
