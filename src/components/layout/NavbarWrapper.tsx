"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";

interface NavUser {
  name: string;
  role: string;
  email: string;
}

export default function NavbarWrapper() {
  const [user, setUser] = useState<NavUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  return <Navbar user={user} />;
}
