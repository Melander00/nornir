
import { useEffect, useState } from "react";

const API = "https://localhost/api";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const response = await fetch(`${API}/api/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();
      console.log(data.user)
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  function login() {
    window.location.assign(`${API}/auth/login`);
  }

  async function logout() {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }

  if (loading) return <p>Loading...</p>;

  if (!user) {
    return (
      <main>
        <h1>Welcome</h1>
        <button onClick={login}>
          Sign in with GitLab
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Welcome, {user.name || user.username}</h1>
      {user.email && <p>{user.email}</p>}
      <button onClick={logout}>Log out</button>
    </main>
  );
}
