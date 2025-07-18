import { NextPage } from 'next';
import { signIn } from 'next-auth/react';

const InstallPage: NextPage = () => {
  const handleInstall = () => {
    // Redirect to GitHub App installation URL
    window.location.href = `https://github.com/apps/YOUR_APP_NAME/installations/new`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-2xl mx-auto text-center p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">Install NexGenGit</h1>
        <p className="mb-6">
          Get AI-powered PR reviews on your repositories. Install the GitHub App to get started.
        </p>
        <button
          onClick={handleInstall}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
        >
          Install on GitHub
        </button>
      </div>
    </div>
  );
};

export default InstallPage; 