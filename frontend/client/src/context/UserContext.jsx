import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Fetch logged-in user from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          "http://localhost/crtv-shots-website/backend/api/users/get_user.php",
          {
            method: "GET",
            credentials: "include", // send PHP session cookie
          }
        );
        const data = await res.json();
        if (!data.error) {
          setUser(data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
