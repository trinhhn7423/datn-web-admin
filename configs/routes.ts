export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  PRODUCTS: '/products',
  ORDERS: '/orders',
};

// Phân quyền route (Ví dụ)
export const PUBLIC_ROUTES = [ROUTES.LOGIN];
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.USERS,
  ROUTES.PRODUCTS,
  ROUTES.ORDERS,
];
