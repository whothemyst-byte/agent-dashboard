import { supabase } from './supabase';
import { getSiteUrl } from './site-url';

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/onboarding`,
    },
  });
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => { await supabase.auth.signOut(); };
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const resendVerificationEmail = async (email: string) => {
  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/onboarding`,
    },
  });
  if (error) throw error;
  return data;
};
