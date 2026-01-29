import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MediaUpload } from '@/components/admin/MediaUpload';
import { Opportunity } from '@/lib/types';

type OpportunityType = 'job' | 'internship' | 'hackathon' | 'competition';

interface EditOpportunityDialogProps {
  opportunity: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpportunityUpdated: () => void;
}

export function EditOpportunityDialog({ opportunity, open, onOpenChange, onOpportunityUpdated }: EditOpportunityDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: opportunity.title,
    type: opportunity.type as OpportunityType,
    description: opportunity.description || '',
    requirements: opportunity.requirements || '',
    location: opportunity.location || '',
    is_remote: opportunity.is_remote,
    deadline: opportunity.deadline?.slice(0, 16) || '',
    experience_level: opportunity.experience_level || '',
    skills_required: opportunity.skills_required?.join(', ') || '',
    salary_min: opportunity.salary_min?.toString() || '',
    salary_max: opportunity.salary_max?.toString() || '',
    salary_currency: opportunity.salary_currency || 'INR',
    application_url: opportunity.application_url || '',
    image_url: opportunity.image_url || '',
    video_url: opportunity.video_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('opportunities')
      .update({
        title: formData.title,
        type: formData.type,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        is_remote: formData.is_remote,
        deadline: formData.deadline || null,
        experience_level: formData.experience_level || null,
        skills_required: formData.skills_required.split(',').map(s => s.trim()).filter(Boolean),
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        application_url: formData.application_url || null,
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
      })
      .eq('id', opportunity.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Opportunity updated successfully!' });
      onOpenChange(false);
      onOpportunityUpdated();
    }
    setIsSubmitting(false);
  };

  const getTypeLabel = (type: OpportunityType) => {
    const labels: Record<OpportunityType, string> = {
      job: 'Job',
      internship: 'Internship',
      hackathon: 'Hackathon',
      competition: 'Competition'
    };
    return labels[type];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Opportunity</DialogTitle>
          <DialogDescription>Update opportunity details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: OpportunityType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="competition">Competition</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            {/* Media Upload Section */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="md:col-span-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={3}
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

            <div className="flex items-center gap-4 pt-6">
              <Switch
                id="is_remote"
                checked={formData.is_remote}
                onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
              />
              <Label htmlFor="is_remote">Remote / Online</Label>
            </div>

            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
                  <SelectItem value="fresher">Fresher</SelectItem>
                  <SelectItem value="0-1 years">0-1 Years</SelectItem>
                  <SelectItem value="1-3 years">1-3 Years</SelectItem>
                  <SelectItem value="3-5 years">3-5 Years</SelectItem>
                  <SelectItem value="5+ years">5+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="skills_required">Skills Required (comma-separated)</Label>
              <Input
                id="skills_required"
                value={formData.skills_required}
                onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
              />
            </div>

            {(formData.type === 'job' || formData.type === 'internship') && (
              <>
                <div>
                  <Label htmlFor="salary_min">Salary Min (₹)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="salary_max">Salary Max (₹)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <Label htmlFor="application_url">Application URL</Label>
              <Input
                id="application_url"
                type="url"
                value={formData.application_url}
                onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-secondary hover:bg-secondary/90">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
