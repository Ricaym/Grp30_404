export const ROUTES = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  upload: '/upload',
  video: (id: string) => `/videos/${id}`,
  videoPattern: '/videos/:id',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
