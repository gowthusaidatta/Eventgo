import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Crown, Users, Briefcase, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CollegeRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { validatePassword } from '@/lib/passwordValidation';

// Import logos as public assets
const adityaLogo = '/aditya-logo.svg';
const eventgoLogo = '/eventgo-logo.svg';

const collegeRoles: { id: CollegeRole; label: string; icon: any; description: string }[] = [
  { id: 'principal', label: 'Principal', icon: Crown, description: 'Head of Institution' },
  { id: 'dean', label: 'Dean', icon: Users, description: 'Faculty Dean' },
  { id: 'coordinator', label: 'Coordinator', icon: Briefcase, description: 'Event Coordinator' },
  { id: 'teaching_staff', label: 'Teaching Staff', icon: BookOpen, description: 'Faculty Member' },
  { id: 'staff_coordinator', label: 'Staff Coordinator', icon: Zap, description: 'Support Staff' },
];

export default function SignupAditya() {
  const [selectedRole, setSelectedRole] = useState<CollegeRole>('coordinator');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [department, setDepartment] = useState('');
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

    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

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

    // Validate phone
    if (phone && !validatePhone(phone)) {
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
      college_role: selectedRole,
      department: department || null,
      is_aditya_subdomain: true,
    };

    const { error } = await signUp(email, password, fullName, 'college', additionalData);

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
      description: 'Welcome to Aditya University × EvntGo. You can now explore opportunities.',
    });
    navigate('/aditya/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-12">
      <Card className="w-full max-w-2xl border-blue-200 shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex justify-center items-center gap-3 mb-4">
            <img src={adityaLogo} alt="Aditya University" className="h-14 w-14" />
            <div className="text-gray-300 text-2xl">|</div>
            <img src={eventgoLogo} alt="EvntGo" className="h-14 w-14" />
          </div>
          <CardTitle className="text-2xl text-blue-900">Aditya University Staff Registration</CardTitle>
          <CardDescription>Create your account to manage events and opportunities</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-blue-900 font-semibold">Select Your Role *</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {collegeRoles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      'flex flex-col items-center p-3 rounded-lg border-2 transition-all text-center',
                      selectedRole === role.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-blue-100 hover:border-blue-300'
                    )}
                  >
                    <role.icon className={cn(
                      'h-5 w-5 mb-1',
                      selectedRole === role.id ? 'text-blue-600' : 'text-blue-400'
                    )} />
                    <span className="text-xs font-semibold text-blue-900">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-3 pt-2">
              <Label className="text-blue-900 font-semibold">Personal Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm text-blue-900">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-blue-900">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@aditya.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm text-blue-900">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm text-blue-900">Department/Unit</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Computer Science"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3 pt-2">
              <Label className="text-blue-900 font-semibold">Security</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-blue-900">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-blue-200 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm text-blue-900">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-blue-200 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 bg-blue-50 rounded-b-lg">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <p className="text-sm text-gray-600 text-center">
              Already have an account?{' '}
              <Link to="/aditya/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
