/**
 * Navigation Utilities for VOID HUNTER
 * Enterprise route mapping between browser URL pathnames and internal application screens.
 */

export const getScreenFromPath = (pathname, _isAuthenticated = false) => {
  const cleanPath = (pathname || window.location.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
  
  if (cleanPath.startsWith('/reset-password')) {
    return 'reset-password';
  }

  switch (cleanPath) {
    case '/settings':
    case '/preferences':
    case '/config':
      return 'settings';
    case '/missions':
      return 'missions';
    case '/hangar':
    case '/ships':
      return 'hangar';
    case '/leaderboard':
    case '/ranks':
      return 'leaderboard';
    case '/dashboard':
      return 'dashboard';
    case '/wallet':
    case '/rewards':
    case '/ledger':
      return 'wallet';
    case '/quests':
    case '/achievements':
      return 'quests';
    case '/admin':
    case '/audit':
      return 'admin';
    case '/auth':
    case '/login':
    case '/signup':
    case '/register':
      return 'auth';
    case '/gameplay':
    case '/combat':
    case '/game':
      return 'gameplay';
    case '/':
    case '/landing':
    case '/home':
    default:
      return 'landing';
  }
};

export const getPathFromScreen = (screen) => {
  switch (screen) {
    case 'reset-password':
      return window.location.pathname.startsWith('/reset-password') ? window.location.pathname : '/reset-password';
    case 'settings':
      return '/settings';
    case 'missions':
      return '/missions';
    case 'hangar':
      return '/hangar';
    case 'leaderboard':
      return '/leaderboard';
    case 'dashboard':
      return '/dashboard';
    case 'wallet':
      return '/wallet';
    case 'quests':
      return '/quests';
    case 'admin':
      return '/admin';
    case 'auth':
      return '/auth';
    case 'gameplay':
      return '/gameplay';
    case 'landing':
    default:
      return '/';
  }
};
