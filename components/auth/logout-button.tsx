"use client";

import { logout } from "@/actions/logout";

interface LogoutButtonProps {
  children?: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onClick = () => {
    console.log("logout button clicked");
    logout();
  };

  return (
    <span className="cursor-pointer flex justify-between items-center h-full w-full" onClick={onClick}>
      {children}
    </span>
  );
};
