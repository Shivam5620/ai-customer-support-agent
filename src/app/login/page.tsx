"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type LoginUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  customerId?: string;
};

type LoginResponse = {
  success: boolean;
  message?: string;
  user?: LoginUser;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const responseText = await response.text();

      if (!responseText.trim()) {
        throw new Error(
          `Server returned an empty response (${response.status})`
        );
      }

      let data: LoginResponse;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned invalid JSON (${response.status})`
        );
      }

      if (!response.ok || !data.success || !data.user) {
        throw new Error(data.message || "Login failed.");
      }

      const redirect = searchParams.get("redirect");

      if (data.user.role === "admin") {
        router.push(redirect || "/admin");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Login</h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue to AI Customer Support
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-7 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          <p className="font-semibold text-gray-800">Demo Accounts</p>

          <div className="mt-3 space-y-3">
            <div>
              <p className="font-medium">Admin</p>
              <p>admin@example.com</p>
              <p>Admin@123</p>
            </div>

            <div>
              <p className="font-medium">Customer</p>
              <p>customer@example.com</p>
              <p>Customer@123</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <p className="text-gray-600">Loading...</p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}