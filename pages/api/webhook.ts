import { Webhooks } from '@octokit/webhooks';
import { IncomingMessage, ServerResponse } from 'http';
import { Together } from 'together-ai';
import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY! });
const model = process.env.OPENAI_MODEL || 'meta-llama/Llama-3-70B-Instruct-Turbo-Free';

const webhooks = new Webhooks({
  secret: process.env.WEBHOOK_SECRET || '',
});

const AI_PROMPT_TEMPLATE = `
As a senior software engineer with 15+ years of experience, review this pull request thoroughly.

**Pull Request Title**: {PR_TITLE}
**Repository**: {REPO_NAME}
**Author**: {PR_AUTHOR}

**Review Guidelines**:
1. Code Quality
2. Logic Errors
3. Security
4. Performance
5. Best Practices
6. Readability
7. Testing

**Code Changes**:
\`\`\`diff
{PR_DIFF}
\`\`\`

**Provide your review** (Markdown formatted):
- Group feedback by category (Critical, Suggestions, Nitpicks)
- Use code examples
- Be concise but thorough
`;

webhooks.on('pull_request', async ({ payload }) => {
  const { pull_request, repository, action } = payload;

  if (!['opened', 'synchronize', 'reopened'].includes(action)) {
    console.log(`Ignoring pull_request action: ${action}`);
    return;
  }

  console.log(`🔧 Processing PR #${pull_request.number} in ${repository.full_name}`);

  try {
    const diffResponse = await fetch(pull_request.diff_url);
    const diff = await diffResponse.text();

    if (!diff || diff.length < 20) {
      console.warn('⚠️ Diff is empty or too small to review.');
      return;
    }

    const prompt = AI_PROMPT_TEMPLATE
      .replace('{PR_TITLE}', pull_request.title)
      .replace('{REPO_NAME}', repository.full_name)
      .replace('{PR_AUTHOR}', pull_request.user?.login || 'unknown')
      .replace('{PR_DIFF}', diff);

    const review = await generateAIReview(prompt);

    await postPRComment(
      repository.owner.login,
      repository.name,
      pull_request.number,
      review
    );

    console.log(`✅ Comment posted for PR #${pull_request.number}`);
  } catch (error) {
    console.error(`❌ Error processing PR #${pull_request.number}:`, error);
  }
});

async function generateAIReview(prompt: string): Promise<string> {
  try {
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [
      {
        role: 'system',
        content: 'You are a senior software engineer AI assistant. Provide a markdown-formatted PR review.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const resp = await together.chat.completions.create({
      model,
      messages,
      max_tokens: 1500,
    });

    let output = resp.choices?.[0]?.message?.content;

    if (typeof output !== 'string') {
      output = JSON.stringify(output, null, 2);
    }

    return output;
  } catch (err: any) {
    console.error('AI Review Error:', err.response?.data || err.message);
    return '⚠️ Failed to generate AI review.';
  }
}

async function postPRComment(owner: string, repo: string, prNumber: number, body: string) {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!appId || !privateKey) {
    console.error('Missing GitHub App credentials');
    return;
  }

  const auth = createAppAuth({ appId, privateKey });

  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: { appId, privateKey },
  });

  try {
    const { data: installation } = await appOctokit.request(
      'GET /repos/{owner}/{repo}/installation',
      { owner, repo }
    );

    const installationAuth = await auth({
      type: 'installation',
      installationId: installation.id,
    });

    const octokit = new Octokit({ auth: installationAuth.token });

    await octokit.request(
      'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
      {
        owner,
        repo,
        issue_number: prNumber,
        body: `## 🤖 NexGenGit AI Review\n\n${body}`,
      }
    );
  } catch (err) {
    console.error('❌ Error posting PR comment:', err);
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf-8');

  try {
    await webhooks.verifyAndReceive({
      id: req.headers['x-github-delivery'] as string,
      name: req.headers['x-github-event'] as string,
      payload: rawBody,
      signature: req.headers['x-hub-signature-256'] as string,
    });

    res.statusCode = 200;
    res.end('Webhook processed');
  } catch (err) {
    console.error('❌ Webhook verification failed:', err);
    res.statusCode = 500;
    res.end('Webhook error');
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
