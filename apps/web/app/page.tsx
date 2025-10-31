"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { LoginForm, SignUpForm } from "@/components/auth/auth-forms";
import { Env } from "@/lib/Env";

export default function Home() {
  const { data: session, isPending: isLoading } = authClient.useSession();
  const [activeForm, setActiveForm] = useState<"login" | "signup">("login");

  const oAuthSignIn = async () => {
      const data = await authClient.signIn.social({
          provider: "github",
          callbackURL: Env.NEXT_PUBLIC_APP_URL,
      })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
          <p className="mb-4">You are signed in as: {session.user?.email}</p>
          <button
            onClick={() => authClient.signOut()}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
          <p className="mb-4">You are signed in as: {session.user?.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-4">
      <button
        onClick={oAuthSignIn}
        className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
      >
        Github
      </button>
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveForm("login")}
            className={`px-4 py-2 rounded-md ${
              activeForm === "login"
                ? "bg-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveForm("signup")}
            className={`px-4 py-2 rounded-md ${
              activeForm === "signup"
                ? "bg-white shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {activeForm === "login" ? <LoginForm /> : <SignUpForm />}
    </div>
  );
}