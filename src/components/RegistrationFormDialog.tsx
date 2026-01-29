import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RegistrationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RegistrationFormData) => Promise<void>;
  title: string;
  description?: string;
  submitLabel?: string;
  isProcessing?: boolean;
}

export interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  graduationYear: string;
  stream: string;
}

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 10 }, (_, i) => (currentYear + i - 4).toString());

const streams = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Data Science',
  'Artificial Intelligence',
  'MBA',
  'BBA',
  'Commerce',
  'Arts',
  'Science',
  'Other',
];

export function RegistrationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  submitLabel = 'Submit',
  isProcessing = false,
}: RegistrationFormDialogProps) {
  const { profile } = useAuth();

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    college: profile?.college_name || '',
    graduationYear: profile?.graduation_year?.toString() || '',
    stream: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!formData.college.trim()) {
      newErrors.college = 'College name is required';
    }

    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Year of passout is required';
    }

    if (!formData.stream) {
      newErrors.stream = 'Stream/Branch is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit(formData);
  };

  const handleChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reg-fullName">Full Name *</Label>
              <Input
                id="reg-fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-email">Email *</Label>
              <Input
                id="reg-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your@email.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-phone">Phone Number *</Label>
              <Input
                id="reg-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="9876543210"
                maxLength={10}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-college">College *</Label>
              <Input
                id="reg-college"
                value={formData.college}
                onChange={(e) => handleChange('college', e.target.value)}
                placeholder="Your college name"
                className={errors.college ? 'border-destructive' : ''}
              />
              {errors.college && <p className="text-xs text-destructive">{errors.college}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg-graduationYear">Year of Passout *</Label>
                <Select
                  value={formData.graduationYear}
                  onValueChange={(value) => handleChange('graduationYear', value)}
                >
                  <SelectTrigger className={errors.graduationYear ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {graduationYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.graduationYear && <p className="text-xs text-destructive">{errors.graduationYear}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-stream">Stream/Branch *</Label>
                <Select
                  value={formData.stream}
                  onValueChange={(value) => handleChange('stream', value)}
                >
                  <SelectTrigger className={errors.stream ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>
                  <SelectContent>
                    {streams.map((stream) => (
                      <SelectItem key={stream} value={stream}>
                        {stream}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.stream && <p className="text-xs text-destructive">{errors.stream}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-secondary hover:bg-secondary/90" disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
