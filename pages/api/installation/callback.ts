import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from 'octokit';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { installation_id, setup_action } = req.query;

  if (setup_action === 'install') {
    try {
      // Store the installation ID for later use
      // You'll need to associate this with the user in your database
      
      // Redirect to success page
      res.redirect('/installation/success');
    } catch (error) {
      res.redirect('/installation/error');
    }
  } else {
    res.redirect('/');
  }
} 