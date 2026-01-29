export type AppRole = 'student' | 'college' | 'company' | 'admin';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export type OpportunityType = 'job' | 'internship' | 'hackathon' | 'competition';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface Profile {
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
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface College {
  id: string;
  user_id: string;
  name: string;
  short_name?: string;
  logo_url?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  description?: string;
  established_year?: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  size?: string;
  headquarters?: string;
  description?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  college_id: string;
  title: string;
  slug?: string;
  description?: string;
  short_description?: string;
  banner_url?: string;
  video_url?: string;
  venue?: string;
  city?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  max_participants?: number;
  is_free: boolean;
  base_price: number;
  status: EventStatus;
  tags?: string[];
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  college?: College;
}

export interface SubEvent {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  venue?: string;
  start_time: string;
  end_time: string;
  max_participants?: number;
  price: number;
  is_team_event: boolean;
  min_team_size: number;
  max_team_size: number;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  company_id?: string;
  title: string;
  type: OpportunityType;
  description?: string;
  requirements?: string;
  location?: string;
  is_remote: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  application_url?: string;
  deadline?: string;
  is_external: boolean;
  external_source?: string;
  external_url?: string;
  skills_required?: string[];
  experience_level?: string;
  image_url?: string;
  video_url?: string;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  sub_event_id?: string;
  team_name?: string;
  team_members?: any;
  status: string;
  registered_at: string;
}

export interface AuthState {
  user: any | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
}
