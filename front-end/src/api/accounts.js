const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// MOCK IMPLEMENTATION
export async function getAccounts(token) {
  console.log("MOCK getAccounts");
  return [
    {
      _id: "mock-account-id",
      email: "mock@nyu.edu",
      name: "Mock User",
    },
  ];
}

export async function addAccount(token, { email, name }) {
  console.log("MOCK addAccount", email, name);
  return {
    _id: "new-mock-account-id",
    email: email,
    name: name,
  };
}

export async function deleteAccount(token, id) {
  console.log("MOCK deleteAccount", id);
  return true;
}

export async function switchAccount(token, id) {
  console.log("MOCK switchAccount", id);
  return { success: true };
}
