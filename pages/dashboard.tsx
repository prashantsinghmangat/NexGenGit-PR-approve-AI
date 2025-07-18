// pages/dashboard.tsx
import { NextPage } from 'next';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';

interface PR {
  id: number;
  title: string;
  html_url: string;
  repo: string;
  number: number;
  created_at: string;
}

interface Installation {
    id: number;
    account: {
      login: string;
      avatar_url?: string;
    };
    repository_selection: 'all' | 'selected';
    repositories_count?: number;  // Made optional
    html_url?: string;            // Made optional
  }

interface InstallationWithRepos extends Installation {
  repositories?: Array<{
    id: number;
    name: string;
    full_name: string;
    private: boolean;
  }>;
}

const Dashboard: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [installedRepos, setInstalledRepos] = useState<InstallationWithRepos[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.accessToken) {
      fetchUserPRs(session.accessToken as string);
      fetchInstalledRepos(session.accessToken as string);
    }
  }, [status, session]);

  const fetchInstalledRepos = async (token: string) => {
    try {
      const octokit = new Octokit({ auth: token });
      
      // First get user's installations
      const { data: installations } = await octokit.request(
        'GET /user/installations',
        {
          headers: {
            // Required header for installations endpoint
            accept: 'application/vnd.github.v3+json',
          },
        }
      );
  
      // If you need repository details, use this:
      const installationsWithRepos = await Promise.all(
        installations.installations.map(async (installation: any) => {
          try {
            const { data: repos } = await octokit.request(
              'GET /user/installations/{installation_id}/repositories',
              { installation_id: installation.id }
            );
            return {
              id: installation.id,
              account: {
                login: installation.account?.login || '',
                avatar_url: installation.account?.avatar_url
              },
              repository_selection: installation.repository_selection || 'selected',
              repositories_count: installation.repositories_count,
              html_url: installation.html_url,
              repositories: repos.repositories
            };
          } catch (err) {
            console.error(`Error fetching repos:`, err);
            return {
              id: installation.id,
              account: {
                login: installation.account?.login || '',
                avatar_url: installation.account?.avatar_url
              },
              repository_selection: installation.repository_selection || 'selected',
              repositories_count: installation.repositories_count
            };
          }
        })
      );
  
      setInstalledRepos(installationsWithRepos);
      setError(null);
    } catch (error) {
      console.error('Error fetching installations:', error);
      setError('Failed to load installations. Please ensure you have granted all required permissions.');
    }
  };

  const fetchUserPRs = async (token: string) => {
    try {
      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.request('GET /user/repos', {
        per_page: 100,
      });

      // Get PRs from all repositories
      const allPrs: PR[] = [];
      for (const repo of data) {
        try {
          const { data: repoPrs } = await octokit.request(
            'GET /repos/{owner}/{repo}/pulls',
            {
              owner: repo.owner.login,
              repo: repo.name,
              state: 'open',
            }
          );

          repoPrs.forEach((pr: any) => {
            allPrs.push({
              id: pr.id,
              title: pr.title,
              html_url: pr.html_url,
              repo: repo.full_name,
              number: pr.number,
              created_at: pr.created_at,
            });
          });
        } catch (err) {
          console.error(`Error fetching PRs for ${repo.full_name}:`, err);
        }
      }

      setPrs(allPrs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setError(null);
    } catch (error) {
      console.error('Error fetching PRs:', error);
      setError('Failed to load pull requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallApp = () => {
    window.location.href = `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'your-app-name'}/installations/new`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex items-center mb-4">
            <img
              src={session.user?.image || ''}
              alt="User avatar"
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <p className="text-lg font-semibold">
                Welcome, {session.user?.name}!
              </p>
              <p className="text-gray-600">
                NexGenGit is monitoring your repositories for new pull requests.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">How it works:</h3>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>Install NexGenGit on your repositories</li>
              <li>Create a new pull request</li>
              <li>Our AI will automatically review the changes</li>
              <li>Check the PR comments for detailed feedback</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Installed Repositories</h2>
            <button
              onClick={handleInstallApp}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Install on More Repositories
            </button>
          </div>
          
          {installedRepos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {installedRepos.map((installation) => (
                <div key={installation.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center mb-2">
                    {installation.account.avatar_url && (
                      <img
                        src={installation.account.avatar_url}
                        alt={`${installation.account.login} avatar`}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <a
                      href={`https://github.com/${installation.account.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                    >
                      {installation.account.login}
                    </a>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {installation.repository_selection === 'all' ? 'All repositories' : 'Selected repositories'} ({installation.repositories_count})
                  </p>
                  {installation.repositories && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">Sample repositories:</p>
                      <div className="space-y-1">
                        {installation.repositories.slice(0, 3).map(repo => (
                          <a
                            key={repo.id}
                            href={`https://github.com/${repo.full_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-600 hover:underline truncate"
                          >
                            {repo.name}
                          </a>
                        ))}
                        {installation.repositories.length > 3 && (
                          <p className="text-xs text-gray-400">+{installation.repositories.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">NexGenGit is not installed on any repositories yet.</p>
              <button
                onClick={handleInstallApp}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Install NexGenGit
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Recent Pull Requests</h2>
          {prs.length > 0 ? (
            <div className="space-y-4">
              {prs.map((pr) => (
                <div
                  key={pr.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <a
                        href={pr.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {pr.title} #{pr.number}
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        {pr.repo} • {new Date(pr.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Pending Review
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No open pull requests found in your repositories.
              </p>
              <p className="text-gray-400 mt-2">
                Create a new PR to see the AI review in action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;