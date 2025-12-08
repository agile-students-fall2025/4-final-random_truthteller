function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getAccounts(token) {
  const res = await fetch("/api/accounts", {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}

export async function addAccount(token, { email, name }) {
  const res = await fetch("/api/accounts", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ email, name }),
  });
  if (!res.ok) {
    const txt = await res.json().catch(() => ({}));
    throw new Error(txt.error || "Failed to add account");
  }
  return res.json();
}

export async function deleteAccount(token, id) {
  const res = await fetch(`/api/accounts/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (![200, 204].includes(res.status)) {
    throw new Error("Failed to delete account");
  }
  return true;
}

export async function switchAccount(token, id) {
  const res = await fetch(`/api/accounts/${id}/current`, {
    method: "PUT",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const txt = await res.json().catch(() => ({}));
    throw new Error(txt.error || "Failed to switch account");
  }
  return res.json();
}
