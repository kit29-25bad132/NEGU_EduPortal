import { getSupabaseClient } from './client';
import { UserProfile, UserRole } from '../../types';

export interface AuthState {
  user: UserProfile | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
}

export async function signUpUser(params: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  registrationNumber?: string;
  departmentId?: string;
}) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  // 1. Sign up user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
        role: params.role,
      },
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Failed to create account.');
  }

  const userId = authData.user.id;

  // 2. Insert into public.profiles table
  const profilePayload = {
    id: userId,
    email: params.email,
    full_name: params.fullName,
    role: params.role,
    department_id: params.departmentId || null,
    is_verified: true,
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert([profilePayload], { onConflict: 'id' });

  if (profileError) {
    console.error('Failed to save public profile:', profileError.message);
  }

  // 3. If user is a student, associate with student_master roster entry if present
  if (params.role === 'student' && params.registrationNumber) {
    await supabase
      .from('student_master')
      .update({ status: 'ACTIVE' })
      .eq('registration_number', params.registrationNumber);
  }

  return authData.user;
}

export async function signInUser(email: string, password: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOutUser() {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) return null;

  const user = sessionData.session.user;

  // Fetch role and details from public profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile) {
    return {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      role: profile.role as UserRole,
      avatarUrl: profile.avatar_url,
      phone: profile.phone,
      isVerified: profile.is_verified,
      departmentId: profile.department_id,
    };
  }

  // Fallback to auth metadata if profile record doesn't exist yet
  return {
    id: user.id,
    fullName: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: (user.user_metadata.role as UserRole) || 'student',
    isVerified: true,
  };
}

export async function resetPassword(email: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}
