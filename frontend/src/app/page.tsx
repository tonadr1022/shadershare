"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user data to check if already logged in
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:8080/auth/user", {
          credentials: "include", // Ensure cookies are sent
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.email); // Assuming the API returns the user email
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = () => {
    // Redirect to backend OAuth route
    window.location.href = "http://localhost:8080/auth/google";
  };

  return (
    <>
      <div>
        {user ? (
          <p>Welcome, {user}</p>
        ) : (
          <button onClick={handleLogin}>Login with Google</button>
        )}
      </div>
    </>
  );
}
