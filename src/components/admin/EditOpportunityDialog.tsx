import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pencil } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type OpportunityType = Database['public']['Enums']['opportunity_type'];

interface EditOpportunityDialogProps {
  opportunity: {
    id: string;
    title: string;
    description: string | null;
    requirements: string | null;
    type: OpportunityType;
    company_id: string | null;
    location: string | null;
    is_remote: boolean | null;
    experience_level: string | null;
    salary_min: number | null;
    salary_max: number | null;
    deadline: string | null;
    skills_required: string[] | null;
    is_active: boolean | null;
    is_external: boolean | null;
    external_url: string | null;
    external_source: string | null;
  };
  companies: { id: string; name: string }[];
  onSuccess: () => void;
}

export function EditOpportunityDialog({ opportunity, companies, onSuccess }: EditOpportunityDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: opportunity.title,
    description: opportunity.description || '',
    requirements: opportunity.requirements || '',
    type: opportunity.type,
    company_id: opportunity.company_id || '',
    location: opportunity.location || '',
    is_remote: opportunity.is_remote ?? false,
    experience_level: opportunity.experience_level || '',
    salary_min: opportunity.salary_min?.toString() || '',
    salary_max: opportunity.salary_max?.toString() || '',
    deadline: formatDateForInput(opportunity.deadline),
    skills_required: opportunity.skills_required?.join(', ') || '',
    is_active: opportunity.is_active ?? true,
    is_external: opportunity.is_external ?? false,
    external_url: opportunity.external_url || '',
    external_source: opportunity.external_source || '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: opportunity.title,
        description: opportunity.description || '',
        requirements: opportunity.requirements || '',
        type: opportunity.type,
        company_id: opportunity.company_id || '',
        location: opportunity.location || '',
        is_remote: opportunity.is_remote ?? false,
        experience_level: opportunity.experience_level || '',
        salary_min: opportunity.salary_min?.toString() || '',
        salary_max: opportunity.salary_max?.toString() || '',
        deadline: formatDateForInput(opportunity.deadline),
        skills_required: opportunity.skills_required?.join(', ') || '',
        is_active: opportunity.is_active ?? true,
        is_external: opportunity.is_external ?? false,
        external_url: opportunity.external_url || '',
        external_source: opportunity.external_source || '',
      });
    }
  }, [open, opportunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const { error } = await supabase.from('opportunities').update({
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      type: formData.type,
      company_id: formData.company_id || null,
      location: formData.location,
      is_remote: formData.is_remote,
      experience_level: formData.experience_level,
      salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
      deadline: formData.deadline || null,
      skills_required: formData.skills_required ? formData.skills_required.split(',').map(s => s.trim()) : null,
      is_active: formData.is_active,
      is_external: formData.is_external,
      external_url: formData.external_url || null,
      external_source: formData.external_source || null,
    }).eq('id', opportunity.id);

    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Opportunity updated successfully' });
      setOpen(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <Label htmlFor="company">Company</Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData({ ...formData, company_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
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
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="salary_min">Salary Min (₹)</Label>
              <Input
                id="salary_min"
                type="number"
                value={formData.salary_min}
                onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="salary_max">Salary Max (₹)</Label>
              <Input
                id="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={formData.skills_required}
                onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
                placeholder="React, TypeScript, Node.js"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_remote"
                checked={formData.is_remote}
                onCheckedChange={(checked) => setFormData({ ...formData, is_remote: !!checked })}
              />
              <Label htmlFor="is_remote" className="cursor-pointer">Remote Work</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox
                id="is_external"
                checked={formData.is_external}
                onCheckedChange={(checked) => setFormData({ ...formData, is_external: !!checked })}
              />
              <Label htmlFor="is_external" className="cursor-pointer">External Listing</Label>
            </div>
            {formData.is_external && (
              <>
                <div>
                  <Label htmlFor="external_url">External URL</Label>
                  <Input
                    id="external_url"
                    type="url"
                    value={formData.external_url}
                    onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="external_source">Source Platform</Label>
                  <Input
                    id="external_source"
                    value={formData.external_source}
                    onChange={(e) => setFormData({ ...formData, external_source: e.target.value })}
                    placeholder="e.g., Unstop, LinkedIn"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
