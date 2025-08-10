/**
 * Utility to clean up all authentication state from localStorage and sessionStorage
 * This prevents "limbo" states where users cannot successfully log out or switch accounts
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Robust sign out that cleans up state and forces page refresh
 */
export const performRobustSignOut = async (supabaseClient: any, redirectPath: string = '/') => {
  try {
    // Clean up auth state first
    cleanupAuthState();
    
    // Attempt global sign out (continue even if it fails)
    try {
      await supabaseClient.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.warn('Global sign out failed, continuing with cleanup:', err);
    }
    
    // Force page reload for a completely clean state
    window.location.href = redirectPath;
  } catch (error) {
    console.error('Sign out error:', error);
    // Even if there's an error, force reload to clean state
    window.location.href = redirectPath;
  }
};