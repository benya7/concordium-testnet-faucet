import type { NextApiRequest, NextApiResponse } from "next";
import { Rettiwt } from 'rettiwt-api';

type Data = {
  tweetText?: string,
  isValid?: boolean,
  error?: string
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
  }
  
  const { tweetPostedId, address } = req.body;

  if (!tweetPostedId || !address) {
    return res.status(400).json({ error: 'Missing parameters. Please provide tweetPostedId and address.' });
  }

  try {
    const rettiwt = new Rettiwt();
    const response = await rettiwt.tweet.details(tweetPostedId);

    if (!response) {
      return res.status(500).json({ error: 'Unable to retrieve tweet details. The tweet ID might be invalid.' });
    }
    
    const tweetText = response.fullText;
    const isValid = tweetText.includes(address);

    if (!isValid) {
      return res.status(400).json({ error: 'Address verification failed. The address is not found in the tweet content.' });
    }

    return res.status(200).json({ tweetText, isValid });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching the tweet details. Please try again later.' });
  }
}
