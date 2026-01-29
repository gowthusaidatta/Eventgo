// CSV Export utility for admin dashboard

interface UserExportData {
  full_name: string;
  email: string;
  phone?: string;
  role?: string;
  college_name?: string;
  graduation_year?: number;
  skills?: string[];
  linkedin_url?: string;
  github_url?: string;
  is_active: boolean;
  created_at: string;
}

export function exportUsersToCSV(users: UserExportData[], filename: string = 'users_export.csv') {
  const headers = [
    'Full Name',
    'Email',
    'Phone',
    'Role',
    'College/Company',
    'Graduation Year',
    'Skills',
    'LinkedIn',
    'GitHub',
    'Status',
    'Created At'
  ];

  const csvRows = [
    headers.join(','),
    ...users.map(user => [
      escapeCSV(user.full_name),
      escapeCSV(user.email),
      escapeCSV(user.phone || ''),
      escapeCSV(user.role || ''),
      escapeCSV(user.college_name || ''),
      user.graduation_year || '',
      escapeCSV(user.skills?.join('; ') || ''),
      escapeCSV(user.linkedin_url || ''),
      escapeCSV(user.github_url || ''),
      user.is_active ? 'Active' : 'Inactive',
      new Date(user.created_at).toLocaleDateString()
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');
  downloadCSV(csvContent, filename);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
