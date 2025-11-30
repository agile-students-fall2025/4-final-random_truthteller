const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const txt = await res.json().catch(() => ({}));
    throw new Error(txt.error || "Login failed");
  }
  return res.json();
}

export async function register(email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const txt = await res.json().catch(() => ({}));
    throw new Error(txt.error || "Register failed");
  }
  return res.json();
}

export async function logout(token) {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  // treat non-2xx as non-fatal for logout
  return res.status;
}

export async function changePassword(token, currentPassword, newPassword) {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const txt = await res.json().catch(() => ({}));
    throw new Error(txt.error || "Failed to change password");
  }
  return res.json();
}
