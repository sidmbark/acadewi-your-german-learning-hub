import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: 'etudiant' | 'professeur' | 'gestionnaire' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<'etudiant' | 'professeur' | 'gestionnaire' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to get highest priority role
  const getHighestPriorityRole = (roles: Array<{ role: string }>) => {
    if (!roles || roles.length === 0) return 'etudiant';
    
    // Priority order: gestionnaire > professeur > etudiant
    if (roles.some(r => r.role === 'gestionnaire')) return 'gestionnaire';
    if (roles.some(r => r.role === 'professeur')) return 'professeur';
    return 'etudiant';
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user roles (can be multiple)
          setTimeout(async () => {
            const { data: rolesData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id);
            
            const highestRole = getHighestPriorityRole(rolesData || []);
            setUserRole(highestRole as 'etudiant' | 'professeur' | 'gestionnaire');
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .then(({ data }) => {
            const highestRole = getHighestPriorityRole(data || []);
            setUserRole(highestRole as 'etudiant' | 'professeur' | 'gestionnaire');
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) return { error };
      
      // Fetch all user roles and prioritize
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);
      
      const role = getHighestPriorityRole(rolesData || []);
      
      // Navigate based on role
      if (role === 'gestionnaire') {
        navigate('/gestionnaire/dashboard');
      } else if (role === 'professeur') {
        navigate('/prof/dashboard');
      } else {
        navigate('/dashboard');
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: metadata,
        },
      });
      
      if (error) return { error };
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase first
      await supabase.auth.signOut();
      
      // Then clear local state
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      // Finally navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if signOut fails, clear local state and navigate
      setUser(null);
      setSession(null);
      setUserRole(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
