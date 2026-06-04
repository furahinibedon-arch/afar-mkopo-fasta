const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "";

export async function loginUser(data: {
  email?: string;
  password?: string;
}) {
  if (!data.email || !data.password) {
    throw new Error("Please fill in all fields");
  }
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email, password: data.password }),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
}

export async function registerUser(data: {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}) {
  if (!data.email || !data.password || !data.firstName || !data.lastName || !data.phone) {
    throw new Error("Please fill in all fields");
  }
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Registration failed");
  return response.json();
}
