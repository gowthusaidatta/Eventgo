import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, GraduationCap, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AppRole } from '@/lib/types';
import evntgoLogo from '@/assets/evntgo-logo.jpeg';
import { cn } from '@/lib/utils';
import { validatePassword, getPasswordStrength } from '@/lib/passwordValidation';

const roles: { id: AppRole; label: string; icon: any; description: string }[] = [
  { id: 'student', label: 'Student', icon: GraduationCap, description: 'Find events & opportunities' },
  { id: 'college', label: 'College', icon: Building2, description: 'Host events & manage registrations' },
  { id: 'company', label: 'Company', icon: Briefcase, description: 'Post jobs & hire talent' },
];

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 10 }, (_, i) => (currentYear + i - 4).toString());

export default function Signup() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') as AppRole || 'student';
  
  const [selectedRole, setSelectedRole] = useState<AppRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validatePhone = (phoneNumber: string): boolean => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: 'Weak Password',
        description: passwordValidation.message,
        variant: 'destructive',
      });
      return;
    }

    // Validate phone for students
    if (selectedRole === 'student' && phone && !validatePhone(phone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const additionalData: any = {
      phone: phone || null,
    };
    
    if (selectedRole === 'student') {
      additionalData.collegeName = collegeName || null;
      additionalData.graduationYear = graduationYear ? parseInt(graduationYear) : null;
    } else if (selectedRole === 'college') {
      additionalData.collegeName = organizationName;
      additionalData.city = city;
    } else if (selectedRole === 'company') {
      additionalData.companyName = organizationName;
    }

    const { error } = await signUp(email, password, fullName, selectedRole, additionalData);

    if (error) {
      toast({
        title: 'Signup failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: 'Account created!',
      description: 'Welcome to EvntGo. You can now explore opportunities.',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex justify-center mb-4">
            <img src={evntgoLogo} alt="EvntGo" className="h-16 w-auto rounded-lg" />
          </Link>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join EvntGo to discover amazing opportunities</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>I am a</Label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      'flex flex-col items-center p-4 rounded-lg border-2 transition-all',
                      selectedRole === role.id
                        ? 'border-secondary bg-secondary/10'
                        : 'border-border hover:border-secondary/50'
                    )}
                  >
                    <role.icon className={cn(
                      'h-6 w-6 mb-2',
                      selectedRole === role.id ? 'text-secondary' : 'text-muted-foreground'
                    )} />
                    <span className="text-sm font-medium">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number {selectedRole === 'student' ? '' : '(Optional)'}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
              />
            </div>

            {/* Student-specific fields */}
            {selectedRole === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="collegeName">College Name</Label>
                  <Input
                    id="collegeName"
                    placeholder="Your college/university name"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Year of Passout</Label>
                  <Select value={graduationYear} onValueChange={setGraduationYear}>
                    <SelectTrigger>
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
                </div>
              </>
            )}

            {/* Organization Name (for college/company) */}
            {(selectedRole === 'college' || selectedRole === 'company') && (
              <div className="space-y-2">
                <Label htmlFor="orgName">
                  {selectedRole === 'college' ? 'College Name *' : 'Company Name *'}
                </Label>
                <Input
                  id="orgName"
                  placeholder={selectedRole === 'college' ? 'IIT Delhi' : 'Acme Inc.'}
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                />
              </div>
            )}

            {/* City (for college) */}
            {selectedRole === 'college' && (
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="New Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, upper, lower, number"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <p className={`text-xs ${
                  getPasswordStrength(password) === 'strong' ? 'text-green-600' :
                  getPasswordStrength(password) === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  Password strength: {getPasswordStrength(password)}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-secondary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
