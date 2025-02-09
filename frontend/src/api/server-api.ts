"server-only";

import { User } from "@/types/auth";
import { fullAPIPath } from "./api";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const fetchMe = async (): Promise<User | undefined> => {
  const res = await fetch(`${fullAPIPath}/me`, {
    headers: await headers(),
  });
  if (!res.ok) {
    return undefined;
  }
  return res.json();
};

export const logoutUserServer = async () => {
  // TODO: make an array of auth only ?
  revalidatePath(`${fullAPIPath}/me`);
  redirect("/");
};
