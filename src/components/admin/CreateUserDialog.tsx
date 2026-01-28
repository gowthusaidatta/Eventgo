import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface CreateUserDialogProps {
  onSuccess: () => void;
}

export function CreateUserDialog({ onSuccess }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student' as AppRole,
    phone: '',
    college_name: '',
    graduation_year: '',
    skills: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    // For college/company roles
    organization_name: '',
    city: '',
    industry: '',
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'student',
      phone: '',
      college_name: '',
      graduation_year: '',
      skills: '',
      bio: '',
      linkedin_url: '',
      github_url: '',
      organization_name: '',
      city: '',
      industry: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.full_name) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      // Create user via Supabase Auth admin API through edge function would be ideal
      // For now, we'll use signUp and then update the profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone || null,
        college_name: formData.college_name || null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : null,
        bio: formData.bio || null,
        linkedin_url: formData.linkedin_url || null,
        github_url: formData.github_url || null,
      });

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      // Create user role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: formData.role,
      });

      if (roleError) {
        console.error('Role error:', roleError);
      }

      // Create college or company if needed
      if (formData.role === 'college' && formData.organization_name) {
        await supabase.from('colleges').insert({
          user_id: authData.user.id,
          name: formData.organization_name,
          city: formData.city || null,
        });
      }

      if (formData.role === 'company' && formData.organization_name) {
        await supabase.from('companies').insert({
          user_id: authData.user.id,
          name: formData.organization_name,
          industry: formData.industry || null,
        });
      }

      toast({ title: 'Success', description: `User ${formData.full_name} created successfully` });
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Account Info */}
            <div className="col-span-2 border-b pb-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Account Information</h3>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: AppRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="college">College</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Profile Info */}
            <div className="col-span-2 border-b pb-2 pt-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Profile Information</h3>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            {formData.role === 'student' && (
              <>
                <div>
                  <Label htmlFor="college_name">College Name</Label>
                  <Input
                    id="college_name"
                    value={formData.college_name}
                    onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="graduation_year">Graduation Year</Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                    placeholder="2026"
                    min={2020}
                    max={2035}
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, Python, Java"
                  />
                </div>
              </>
            )}
            
            {(formData.role === 'college' || formData.role === 'company') && (
              <>
                <div className="col-span-2 border-b pb-2 pt-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {formData.role === 'college' ? 'College' : 'Company'} Details
                  </h3>
                </div>
                <div>
                  <Label htmlFor="organization_name">{formData.role === 'college' ? 'College' : 'Company'} Name *</Label>
                  <Input
                    id="organization_name"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    required={formData.role === 'college' || formData.role === 'company'}
                  />
                </div>
                {formData.role === 'college' && (
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                )}
                {formData.role === 'company' && (
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="Technology, Finance, etc."
                    />
                  </div>
                )}
              </>
            )}

            {/* Social Links */}
            <div className="col-span-2 border-b pb-2 pt-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Social Links</h3>
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>

            {/* Bio */}
            <div className="col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief description..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
