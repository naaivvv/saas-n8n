import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  const signIn = async (formData: FormData) => {
    "use server";
    
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }

    return redirect("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Login</h2>
          <p className="text-neutral text-sm">Sign in to view the pipeline dashboard.</p>
        </div>

        <form action={signIn} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="admin@example.com" 
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="password">Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors h-12">
            Sign In
          </button>
          
          {searchParams?.message && (
            <p className="mt-4 p-4 bg-danger/20 text-danger text-center rounded-xl text-sm font-medium">
              {searchParams.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
