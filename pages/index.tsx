import { NextPage } from 'next';
import { signIn } from 'next-auth/react';

const Home: NextPage = () => {
  const handleLogin = () => {
    signIn('github', {
      callbackUrl: `${window.location.origin}/dashboard`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">NexGenGit</h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered pull request reviews that work like a virtual senior developer
        </p>
        <button
          onClick={handleLogin}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Login with GitHub
        </button>
      </div>
    </div>
  );
};

export default Home; 