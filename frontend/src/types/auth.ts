export type LoginFormData = {
  username_or_email: string;
  password: string;
};
export type RegisterFormData = {
  username: string;
  email: string;
  password: string;
};

export type UserDetails = {
  num_shaders: number;
  num_playlists: number;
};

export type User = {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  details?: UserDetails | null;
};
