
const API_BASE_URL = "";

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
}

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Registration failed");
  return response.json();
}
