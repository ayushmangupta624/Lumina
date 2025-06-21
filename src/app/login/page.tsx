import { getUser } from "@civic/auth/nextjs";
import { prismaClient } from "@/lib/db";
import { SignOutButton, UserButton } from "@civic/auth/react";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getUser();

  if (user && user.email) {
    await prismaClient.user.upsert({
      where: { email: user.email },
      update: {},
      create: { email: user.email },
    });
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[128px] -z-10"></div>
      <div className="absolute top-40 right-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -z-10"></div>

      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-white/60">
              Sign in to continue to your dashboard
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <UserButton 
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-all duration-200"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
} 