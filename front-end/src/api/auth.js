export async function login(email, password) {
  const res = await fetch("/api/auth/login", {
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
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const txt = await res.json().catch(() => ({}));
    if (txt.errors) {
      //combine all rule errors into a single message
      throw new Error(txt.errors.join("\n"));
    }
    throw new Error(txt.error || "Register failed");
  }
  return res.json();
}

export async function logout(token) {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.status;
}

export async function changePassword(token, currentPassword, newPassword) {
  const res = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const txt = await res.json().catch(() => ({}));
    if (txt.errors) {
      throw new Error(txt.errors.join("\n"));
    }
    throw new Error(txt.error || "Failed to change password");
  }
  return res.json();
}
