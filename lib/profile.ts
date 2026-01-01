import { supabase } from './supabase';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  role: 'user' | 'seller' | 'admin' | 'superadmin';
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
}

export const profileService = {
  // Get current user's profile
  async getProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // Profile might not exist yet for new users
      if (error.code === 'PGRST116') {
        console.log('Profile not found, might be a new user');
        return null;
      }
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  // Update profile
  async updateProfile(updates: UpdateProfileData): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create or ensure profile exists
  async ensureProfile(): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Try to get existing profile
    let profile = await this.getProfile();

    if (!profile) {
      // Create profile if doesn't exist
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'user',
        })
        .select()
        .single();

      if (error) throw error;
      profile = data;
    }

    return profile;
  },

  // Get user's email from auth
  async getUserEmail(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email || null;
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },
};
