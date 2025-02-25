export type LoginFormData = {
  username_or_email: string;
  password: string;
};
export type RegisterFormData = {
  username: string;
  email: string;
  password: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
};
