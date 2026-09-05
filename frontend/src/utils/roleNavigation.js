/**
 * Single source of truth for where each role lands after login and what
 * their dashboard's base path is. Every redirect decision (login success,
 * wrong-role route access, "already logged in") reads from this instead of
 * hard-coding role → path mappings in multiple components.
 */
export const ROLE_HOME_PATHS = {
  student: "/student",
  teacher: "/teacher",
  admin: "/admin",
};

export const getRoleHomePath = (role) => ROLE_HOME_PATHS[role] || "/home";
