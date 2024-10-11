"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { logOut } from "@/actions/auth";

type Props = {
  children: React.ReactNode;
};

export function SignOutButton({ children }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await logOut();
    if (res.success) {
      router.push("/");
    } else {
      console.error("Logout failed:", res.error);
      router.push("/?error=logout_failed");
    }
  };

  return <Button onClick={handleLogout}>{children}</Button>;
}
