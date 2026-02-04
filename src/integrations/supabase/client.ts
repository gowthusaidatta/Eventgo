// This file is deprecated. Using JWT authentication instead.
// Mock object to prevent import errors in pages still importing supabase
export const supabase = {
  auth: {
    onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null } }),
    signOut: async () => {},
  },
  storage: {
    from: () => ({
      upload: async () => {},
      download: async () => {},
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
  from: () => ({
    select: () => ({ data: null }),
    insert: async () => {},
    update: async () => {},
    delete: async () => {},
  }),
} as any;