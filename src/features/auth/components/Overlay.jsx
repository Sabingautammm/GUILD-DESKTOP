export default function Overlay({ isSignUp, setIsSignUp }) {
  return (
    <div
      className={`absolute top-0 left-1/2 h-full w-1/2 overflow-hidden transition-transform duration-500 ease-in-out ${
        isSignUp ? "-translate-x-full" : ""
      }`}
    >
      <div className="relative h-full w-full bg-gradient-to-br from-[#17120D] via-[#3A2712] to-[#B9660B] p-8 text-white flex flex-col justify-center items-center text-center">
        <h3 className="text-2xl font-bold mb-2">
          {isSignUp ? "Welcome Back!" : "Hello, Friend!"}
        </h3>
        <p className="text-xs text-[#FFD873]/80 mb-6 max-w-xs">
          {isSignUp
            ? "To keep connected with us please login with your personal info"
            : "Enter your personal details and start your journey with us"}
        </p>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="rounded-full border border-[#FFD873] px-6 py-2 text-xs font-semibold text-[#FFD873] hover:bg-[#FFD873] hover:text-[#17120D] transition-colors"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
