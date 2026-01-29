import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';
import { MediaUpload } from './MediaUpload';
import type { Database } from '@/integrations/supabase/types';

type OpportunityType = Database['public']['Enums']['opportunity_type'];

interface CreateOpportunityDialogProps {
  companies: { id: string; name: string }[];
  onSuccess: () => void;
  defaultType?: OpportunityType;
  triggerLabel?: string;
}

export function CreateOpportunityDialog({ 
  companies, 
  onSuccess, 
  defaultType = 'job',
  triggerLabel = 'Add Opportunity'
}: CreateOpportunityDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    type: defaultType,
    company_id: '',
    location: '',
    is_remote: false,
    experience_level: '',
    salary_min: '',
    salary_max: '',
    deadline: '',
    skills_required: '',
    is_active: true,
    is_external: false,
    external_url: '',
    external_source: '',
    image_url: '',
    video_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    const { error } = await supabase.from('opportunities').insert({
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
      image_url: formData.image_url || null,
      video_url: formData.video_url || null,
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `${formData.type} created successfully` });
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        type: defaultType,
        company_id: '',
        location: '',
        is_remote: false,
        experience_level: '',
        salary_min: '',
        salary_max: '',
        deadline: '',
        skills_required: '',
        is_active: true,
        is_external: false,
        external_url: '',
        external_source: '',
        image_url: '',
        video_url: '',
      });
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}</DialogTitle>
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

            {/* Media Upload Section */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <MediaUpload
                type="image"
                currentUrl={formData.image_url}
                onUpload={(url) => setFormData({ ...formData, image_url: url })}
                onRemove={() => setFormData({ ...formData, image_url: '' })}
                folder="opportunities"
              />
              <MediaUpload
                type="video"
                currentUrl={formData.video_url}
                onUpload={(url) => setFormData({ ...formData, video_url: url })}
                onRemove={() => setFormData({ ...formData, video_url: '' })}
                folder="opportunities"
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
              <Label htmlFor="is_external" className="cursor-pointer">External Listing (from another platform)</Label>
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
              {loading ? 'Creating...' : `Create ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
