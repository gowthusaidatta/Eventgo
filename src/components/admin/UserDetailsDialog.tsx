import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Phone, GraduationCap, Calendar, MapPin, 
  Linkedin, Github, FileText, Briefcase, Building2, Globe
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
  // Extended info for college/company users
  college?: {
    name: string;
    city?: string;
    state?: string;
    website?: string;
    description?: string;
    established_year?: number;
    is_verified?: boolean;
  };
  company?: {
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
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  if (!user) return null;

  const roleColors: Record<string, string> = {
    student: 'bg-accent text-accent-foreground',
    college: 'bg-secondary text-secondary-foreground',
    company: 'bg-primary text-primary-foreground',
    admin: 'bg-destructive text-destructive-foreground',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-2xl">{user.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={roleColors[user.role || ''] || 'bg-muted'}>
                  {user.role || 'N/A'}
                </Badge>
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
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
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {user.bio && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-muted-foreground">{user.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Education (for students) */}
          {user.role === 'student' && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">College/University</p>
                    <p className="font-medium">{user.college_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Graduation Year</p>
                    <p className="font-medium">{user.graduation_year || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Links */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Links & Documents</h3>
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
            </CardContent>
          </Card>

          {/* College Details (for college role) */}
          {user.role === 'college' && user.college && (
            <Card className="border-secondary">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> College Details
                  {user.college.is_verified && (
                    <Badge variant="default" className="bg-green-500">Verified</Badge>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">College Name</p>
                    <p className="font-medium">{user.college.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">
                      {[user.college.city, user.college.state].filter(Boolean).join(', ') || 'Not provided'}
                    </p>
                  </div>
                  {user.college.established_year && (
                    <div>
                      <p className="text-xs text-muted-foreground">Established Year</p>
                      <p className="font-medium">{user.college.established_year}</p>
                    </div>
                  )}
                  {user.college.website && (
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a href={user.college.website} target="_blank" rel="noopener noreferrer" 
                         className="font-medium text-primary hover:underline flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Visit Website
                      </a>
                    </div>
                  )}
                </div>
                {user.college.description && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm mt-1">{user.college.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Company Details (for company role) */}
          {user.role === 'company' && user.company && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Company Details
                  {user.company.is_verified && (
                    <Badge variant="default" className="bg-green-500">Verified</Badge>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Company Name</p>
                    <p className="font-medium">{user.company.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Industry</p>
                    <p className="font-medium">{user.company.industry || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Headquarters</p>
                    <p className="font-medium">{user.company.headquarters || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Company Size</p>
                    <p className="font-medium">{user.company.size || 'Not provided'}</p>
                  </div>
                  {user.company.website && (
                    <div>
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a href={user.company.website} target="_blank" rel="noopener noreferrer" 
                         className="font-medium text-primary hover:underline flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Visit Website
                      </a>
                    </div>
                  )}
                </div>
                {user.company.description && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm mt-1">{user.company.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
