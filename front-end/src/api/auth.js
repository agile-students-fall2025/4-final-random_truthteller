const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

// MOCK IMPLEMENTATION
export async function login(email, password) {
  console.log("MOCK login", email);
  return {
    token: "mock-token-123",
    user: { id: "mock-user-id", email: email, isAdmin: email === "admin@nyu.edu" },
  };
}

export async function register(email, password) {
  console.log("MOCK register", email);
  return {
    token: "mock-token-123",
    user: { id: "mock-user-id", email: email, isAdmin: email === "admin@nyu.edu" },
  };
}

export async function logout(token) {
  console.log("MOCK logout");
  return 204;
}

export async function changePassword(token, currentPassword, newPassword) {
  console.log("MOCK changePassword");
  return { ok: true };
}
