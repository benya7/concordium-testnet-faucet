import type { NextApiRequest, NextApiResponse } from "next";
import createGRPCNodeClient from "@/lib/createGPRCClient";
import { getSenderAccountSigner } from "@/lib/getSenderAccountSigner";
import createAccountTransaction from "@/lib/createAccountTrasantion";
import { AccountTransactionSignature, signTransaction } from "@concordium/web-sdk";

type Data = {
  transactionHash?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
  }
  const client = createGRPCNodeClient()
  const signer = getSenderAccountSigner()
  const { sender, receiver } = req.body;
  
  if (!sender || !receiver) {
    return res.status(400).json({ error: 'Missing parameters. Please provide sender and receiver.' });
  }
  
  try {
    const accountTransaction = await createAccountTransaction(client, sender, receiver)
    const signature: AccountTransactionSignature = await signTransaction(accountTransaction, signer);

    const transactionHash = await client.sendAccountTransaction(accountTransaction, signature)
    return res.status(200).json({ transactionHash: transactionHash.toString() });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'An error occurred while sending the transaction.' });
  }
}
