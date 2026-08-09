import LoginForm from "../features/auth/components/LoginForm";

export default function AuthPage() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-slate-100 px-4 py-8 sm:px-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-gradient-to-br from-[#17120D] via-[#3A2712] to-[#B9660B] px-6 py-8 text-center">
          <h1 className="text-2xl font-black text-white">GUILD</h1>
          <p className="mt-1 text-xs text-[#FFD873]/80 uppercase tracking-[0.2em]">
            Rule it or join it
          </p>
        </div>
        <div className="px-6 py-8 flex items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}