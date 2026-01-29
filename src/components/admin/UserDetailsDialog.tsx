import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, Mail, Phone, GraduationCap, Calendar, MapPin, 
  Linkedin, Github, FileText, Briefcase, Building2, Globe,
  Pencil, Save, X, CheckCircle, ShieldCheck
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  college_name?: string;
  graduation_year?: number;
  skills?: string[];
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role?: string;
  college?: {
    id: string;
    name: string;
    city?: string;
    state?: string;
    website?: string;
    description?: string;
    established_year?: number;
    is_verified?: boolean;
  };
  company?: {
    id: string;
    name: string;
    industry?: string;
    headquarters?: string;
    website?: string;
    description?: string;
    size?: string;
    is_verified?: boolean;
  };
}

interface UserDetailsDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: () => void;
}

export function UserDetailsDialog({ user, open, onOpenChange, onUserUpdated }: UserDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [editData, setEditData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    college_name: '',
    graduation_year: '',
    skills: '',
    linkedin_url: '',
    github_url: '',
    resume_url: '',
    is_active: true,
    // College fields
    college_city: '',
    college_state: '',
    college_website: '',
    college_description: '',
    college_verified: false,
    // Company fields
    company_industry: '',
    company_headquarters: '',
    company_website: '',
    company_description: '',
    company_size: '',
    company_verified: false,
  });

  useEffect(() => {
    if (user) {
      setEditData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        college_name: user.college_name || '',
        graduation_year: user.graduation_year?.toString() || '',
        skills: user.skills?.join(', ') || '',
        linkedin_url: user.linkedin_url || '',
        github_url: user.github_url || '',
        resume_url: user.resume_url || '',
        is_active: user.is_active,
        college_city: user.college?.city || '',
        college_state: user.college?.state || '',
        college_website: user.college?.website || '',
        college_description: user.college?.description || '',
        college_verified: user.college?.is_verified || false,
        company_industry: user.company?.industry || '',
        company_headquarters: user.company?.headquarters || '',
        company_website: user.company?.website || '',
        company_description: user.company?.description || '',
        company_size: user.company?.size || '',
        company_verified: user.company?.is_verified || false,
      });
      setIsEditing(false);
    }
  }, [user]);

  if (!user) return null;

  const roleColors: Record<string, string> = {
    student: 'bg-accent text-accent-foreground',
    college: 'bg-secondary text-secondary-foreground',
    company: 'bg-primary text-primary-foreground',
    admin: 'bg-destructive text-destructive-foreground',
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editData.full_name,
          phone: editData.phone || null,
          bio: editData.bio || null,
          college_name: editData.college_name || null,
          graduation_year: editData.graduation_year ? parseInt(editData.graduation_year) : null,
          skills: editData.skills ? editData.skills.split(',').map(s => s.trim()).filter(Boolean) : null,
          linkedin_url: editData.linkedin_url || null,
          github_url: editData.github_url || null,
          resume_url: editData.resume_url || null,
          is_active: editData.is_active,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update college if applicable
      if (user.role === 'college' && user.college?.id) {
        const { error: collegeError } = await supabase
          .from('colleges')
          .update({
            city: editData.college_city || null,
            state: editData.college_state || null,
            website: editData.college_website || null,
            description: editData.college_description || null,
            is_verified: editData.college_verified,
          })
          .eq('id', user.college.id);

        if (collegeError) throw collegeError;
      }

      // Update company if applicable
      if (user.role === 'company' && user.company?.id) {
        const { error: companyError } = await supabase
          .from('companies')
          .update({
            industry: editData.company_industry || null,
            headquarters: editData.company_headquarters || null,
            website: editData.company_website || null,
            description: editData.company_description || null,
            size: editData.company_size || null,
            is_verified: editData.company_verified,
          })
          .eq('id', user.company.id);

        if (companyError) throw companyError;
      }

      toast({ title: 'Success', description: 'User profile updated successfully' });
      setIsEditing(false);
      onUserUpdated?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyToggle = async (type: 'college' | 'company', verified: boolean) => {
    try {
      if (type === 'college' && user.college?.id) {
        await supabase.from('colleges').update({ is_verified: verified }).eq('id', user.college.id);
        setEditData(prev => ({ ...prev, college_verified: verified }));
      } else if (type === 'company' && user.company?.id) {
        await supabase.from('companies').update({ is_verified: verified }).eq('id', user.company.id);
        setEditData(prev => ({ ...prev, company_verified: verified }));
      }
      toast({ title: 'Success', description: `${type === 'college' ? 'College' : 'Company'} verification updated` });
      onUserUpdated?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>User Details</DialogTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-2xl">{user.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  className="text-xl font-bold mb-2"
                />
              ) : (
                <h2 className="text-2xl font-bold">{user.full_name}</h2>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge className={roleColors[user.role || ''] || 'bg-muted'}>
                  {user.role || 'N/A'}
                </Badge>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editData.is_active}
                      onCheckedChange={(checked) => setEditData({ ...editData, is_active: checked })}
                    />
                    <span className="text-sm">{editData.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                ) : (
                  <Badge variant={user.is_active ? 'default' : 'secondary'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Member since {format(new Date(user.created_at), 'MMM d, yyyy')} 
                ({formatDistanceToNow(new Date(user.created_at))} ago)
              </p>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4" /> Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    {isEditing ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        placeholder="Enter phone"
                      />
                    ) : (
                      <p className="font-medium">{user.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Bio</h3>
              {isEditing ? (
                <Textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Enter bio"
                  rows={3}
                />
              ) : (
                <p className="text-muted-foreground">{user.bio || 'No bio provided'}</p>
              )}
            </CardContent>
          </Card>

          {/* Education (for students) */}
          {user.role === 'student' && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">College/University</Label>
                    {isEditing ? (
                      <Input
                        value={editData.college_name}
                        onChange={(e) => setEditData({ ...editData, college_name: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium">{user.college_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Graduation Year</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.graduation_year}
                        onChange={(e) => setEditData({ ...editData, graduation_year: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium">{user.graduation_year || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Skills</h3>
              {isEditing ? (
                <Input
                  value={editData.skills}
                  onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                  placeholder="Comma-separated skills"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No skills listed</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Links & Documents</h3>
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">LinkedIn URL</Label>
                    <Input
                      value={editData.linkedin_url}
                      onChange={(e) => setEditData({ ...editData, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">GitHub URL</Label>
                    <Input
                      value={editData.github_url}
                      onChange={(e) => setEditData({ ...editData, github_url: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Resume URL</Label>
                    <Input
                      value={editData.resume_url}
                      onChange={(e) => setEditData({ ...editData, resume_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {user.linkedin_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                      </a>
                    </Button>
                  )}
                  {user.github_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={user.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" /> GitHub
                      </a>
                    </Button>
                  )}
                  {user.resume_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={user.resume_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" /> Resume
                      </a>
                    </Button>
                  )}
                  {!user.linkedin_url && !user.github_url && !user.resume_url && (
                    <p className="text-muted-foreground text-sm">No links provided</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* College Details (for college role) */}
          {user.role === 'college' && user.college && (
            <Card className="border-secondary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> College Details
                  </h3>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm">Verified</span>
                    <Switch
                      checked={editData.college_verified}
                      onCheckedChange={(checked) => handleVerifyToggle('college', checked)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">College Name</Label>
                    <p className="font-medium">{user.college.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={editData.college_city}
                          onChange={(e) => setEditData({ ...editData, college_city: e.target.value })}
                          placeholder="City"
                        />
                        <Input
                          value={editData.college_state}
                          onChange={(e) => setEditData({ ...editData, college_state: e.target.value })}
                          placeholder="State"
                        />
                      </div>
                    ) : (
                      <p className="font-medium">
                        {[user.college.city, user.college.state].filter(Boolean).join(', ') || 'Not provided'}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Website</Label>
                    {isEditing ? (
                      <Input
                        value={editData.college_website}
                        onChange={(e) => setEditData({ ...editData, college_website: e.target.value })}
                        placeholder="https://..."
                      />
                    ) : user.college.website ? (
                      <a href={user.college.website} target="_blank" rel="noopener noreferrer" 
                         className="font-medium text-primary hover:underline flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Visit Website
                      </a>
                    ) : (
                      <p className="font-medium">Not provided</p>
                    )}
                  </div>
                  {user.college.established_year && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Established Year</Label>
                      <p className="font-medium">{user.college.established_year}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.college_description}
                      onChange={(e) => setEditData({ ...editData, college_description: e.target.value })}
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.college.description || 'No description'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Details (for company role) */}
          {user.role === 'company' && user.company && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Company Details
                  </h3>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm">Verified</span>
                    <Switch
                      checked={editData.company_verified}
                      onCheckedChange={(checked) => handleVerifyToggle('company', checked)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Company Name</Label>
                    <p className="font-medium">{user.company.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Industry</Label>
                    {isEditing ? (
                      <Input
                        value={editData.company_industry}
                        onChange={(e) => setEditData({ ...editData, company_industry: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium">{user.company.industry || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Headquarters</Label>
                    {isEditing ? (
                      <Input
                        value={editData.company_headquarters}
                        onChange={(e) => setEditData({ ...editData, company_headquarters: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium">{user.company.headquarters || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Company Size</Label>
                    {isEditing ? (
                      <Input
                        value={editData.company_size}
                        onChange={(e) => setEditData({ ...editData, company_size: e.target.value })}
                        placeholder="e.g., 50-100"
                      />
                    ) : (
                      <p className="font-medium">{user.company.size || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Website</Label>
                    {isEditing ? (
                      <Input
                        value={editData.company_website}
                        onChange={(e) => setEditData({ ...editData, company_website: e.target.value })}
                        placeholder="https://..."
                      />
                    ) : user.company.website ? (
                      <a href={user.company.website} target="_blank" rel="noopener noreferrer" 
                         className="font-medium text-primary hover:underline flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Visit Website
                      </a>
                    ) : (
                      <p className="font-medium">Not provided</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.company_description}
                      onChange={(e) => setEditData({ ...editData, company_description: e.target.value })}
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.company.description || 'No description'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
