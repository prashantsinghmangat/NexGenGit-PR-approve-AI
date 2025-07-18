import { signIn } from "next-auth/react";

const LoginButton = () => {
  const handleLogin = () => {
    signIn("github", {
      callbackUrl: `${window.location.origin}/dashboard`,
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
    >
      Login with GitHub
    </button>
  );
};

export default LoginButton; 