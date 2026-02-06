import { RequireAuth } from "@/providers/RequiredAuth";
import { useAuth } from "@/context/auth/useAuth";

const AuthedHome = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2 style={{ marginTop: 0 }}>Authed ✅</h2>
      <p>
        Current user: <b>{user?.name}</b> ({user?.role ?? "n/a"})
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={logout}>Logout</button>
        <button onClick={() => alert("Go Console")}>Console</button>
        <button onClick={() => alert("Go Terminal")}>Terminal</button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <RequireAuth>
      <AuthedHome />
    </RequireAuth>
  );
};

export default App;
