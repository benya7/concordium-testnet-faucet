import { useEffect, useState } from "react";

import { AccountAddress } from "@concordium/web-sdk";
import { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import { useMediaQuery } from "usehooks-ts";

import { ErrorAlert } from "@/components/ErrorAlert";
import { SingleInputForm } from "@/components/SingleInpuForm";
import { Step } from "@/components/Step";
import { TWEET_TEMPLATE } from "@/lib/constants";
import getLatestTransactions from "@/lib/getLatestTransactions";
import { extractITweetdFromUrl, formatTimestamp, formatTxHash } from "@/lib/utils";

import concordiumLogo from "../../public/concordium-logo-back.svg"
import poweredByConcordium from "../../public/powered_by_concordium_light.png";

const IBMPlexMono = IBM_Plex_Mono({ weight: ["400", "600", "700"], subsets: ["latin"], display: "swap", variable: "--font-ibm-plex-mono"});




export default function Home() {
  const [latestTransactions, setLatestTransactions] = useState<PartialTransaction[]>([]);
  const [address, setAddress] = useState<string>("");
  const [addressValidationError, setAddressValidationError] = useState<string | undefined>();

  const [tweetPostedUrl, setTweetPostedUrl] = useState('');
  const [tweetPostedId, setTweetPostedId] = useState<string | undefined>();

  const [isValidTweetUrl, setIsValidTweetUrl] = useState<boolean | undefined>();
  const [isValidVerification, setIsValidVerification] = useState<boolean | undefined>();
  const [isVerifyLoading, setIsVerifyLoading] = useState<boolean>(false);

  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  
  const [error, setError] = useState<string | undefined>();
  const isXl = useMediaQuery('(max-width: 768px)')
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value);

  const handleTweetUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsValidTweetUrl(undefined)
    setIsValidVerification(undefined)

    setTweetPostedUrl(e.target.value)
    const tweetId = extractITweetdFromUrl(e.target.value)
    if (!tweetId) {
      setIsValidTweetUrl(false)
    } else {
      setIsValidTweetUrl(true)
      setTweetPostedId(tweetId)
    }
  };

  const handlePostTweet = () => window.open(
    `https://x.com/intent/tweet?text=${encodeURIComponent(TWEET_TEMPLATE + " " + address)}`,
    '_blank',
    'width=500,height=500'
  );

  const verifyTweet = async () => {
    try {
      const response = await fetch('/api/verifyTweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetPostedId, address }),
      });
  
      const data = await response.json();
  
      return { ok: response.ok, data };
    } catch (error) {
      throw new Error("Network error. Please check your connection.");
    }
  };
  
  const sendTokens = async () => {
    try {
      const response = await fetch('/api/sendTokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender: process.env.NEXT_PUBLIC_SENDER_ADDRESS, receiver: address }),
      });
  
      const data = await response.json();
  
      return { ok: response.ok, data };
    } catch (error) {
      throw new Error("Network error. Please check your connection.");
    }
  };

  const handleVerifyTweetAndSendTokens = async () => {
    setIsVerifyLoading(true)
    try {
      const { ok: verifyOk, data: verifyData } = await verifyTweet();
  
      if (verifyOk) {
        setIsValidVerification(verifyData.isValid);
        await new Promise(resolve => setTimeout(resolve, 2000))
        const { ok: sendOk, data: sendData } = await sendTokens();
        await new Promise(resolve => setTimeout(resolve, 15000))
        if (sendOk) {
          setTransactionHash(sendData.transactionHash);
        } else {
          setError(sendData.error);
        }
      } else {
        setIsValidVerification(false);
        setIsVerifyLoading(false)
        setError(verifyData.error);
      }
    } catch (error: any) {
      setIsVerifyLoading(false)
      setError(error.message);
    }
  };
  
  useEffect(() => {
    if (!address) {
      setAddressValidationError(undefined)
      return
    }
    try {
      AccountAddress.fromBase58(address);
      setAddressValidationError(undefined)
    } catch (error) {
      setAddressValidationError("Invalid address. Please insert a valid one.")
    }
  }, [address])

  useEffect(() => {
    if (!error) {
      return
    }
    setTimeout(() => {
      setError(undefined)
    }, 10000);
  }, [error])

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactions = await getLatestTransactions();
        setLatestTransactions(transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
    const intervalId = setInterval(fetchTransactions, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={`min-h-screen ${IBMPlexMono.className}`}>
      <Head>
        <title>Concordium Testnet Faucet</title>
      </Head>
    <div className="h-24 w-full bg-[--teal] flex items-center justify-center sm:px-10">
      <p className="text-xl md:text-2xl text-center font-semibold text-white">Concordium Testnet Faucet</p>
    </div>
    <main className="flex flex-col items-center justify-between py-8 sm:py-10">
      <p className="text-center text-sm md:text-base mb-4 md:mb-8 px-4">Get Tesnet CDDs every 24 hours for testing your dApps!</p>
      <div className="flex-1 flex flex-col md:flex-row justify-center md:w-full text-sm md:text-base px-4 gap-2 md:gap-6 lg:gap-12">
        <div id="phases" className="flex flex-col items-center justify-between gap-4 md:w-[45%] max-w-xl">
          <Step step={1}/>
          <SingleInputForm
            inputValue={address}
            handleInputValue={handleAddressChange}
            handleSubmitButton={handlePostTweet}
            inputPlaceHolder="Enter your testnet CCD address"
            submitButtonText="Share on X"
            inputDisabled={Boolean(tweetPostedUrl)}
            submitButtonDisabled={!address || (address && Boolean(addressValidationError)) || Boolean(tweetPostedUrl)}
          >
            {addressValidationError && (
              <p className="text-xs text-red-700 h-fit -mt-2">{addressValidationError}</p>
            )}
          </SingleInputForm>
          <Step step={2}/>
          <SingleInputForm
            inputValue={tweetPostedUrl}
            handleInputValue={handleTweetUrlChange}
            handleSubmitButton={handleVerifyTweetAndSendTokens}
            inputPlaceHolder="Enter your X Post link"
            submitButtonText="Verify"
            inputDisabled={!address || Boolean(addressValidationError) || isValidVerification}
            submitButtonDisabled={!isValidTweetUrl || isValidVerification || isVerifyLoading}
          />
          <Step step={3}/>
          <div className="w-full flex flex-col border border-[--dark-blue] rounded-md max-w-xl mb-4 p-2 items-center justify-center min-h-[140px] text-xs md:text-sm text-center font-semibold">
          {isValidVerification ? (
            <>
              <p className="mb-1">X Post Verified Succesfully ✅</p>
              { !transactionHash ? <p>Sending tokens to your address..</p> : <>
                <p className="mb-1">Tokens Sent ✅</p>
                <p className="">Transaction Hash: <a
                  className="hover:cursor-pointer text-blue-500 font-normal"
                  href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/transaction/${transactionHash}`}
                  target="_blank"
                >
                  {formatTxHash(transactionHash)}
                </a>
                </p>
              </>}
            </>
            ) : <p>Pending to verify.</p>}
          </div>
        </div>
        <div id="latest-transactions" className="flex flex-col items-center justify-between gap-4 md:w-[45%] max-w-xl">
          <p>Latest transactions:</p>
          <div className="flex-1 relative border border-[--dark-blue] rounded-md overflow-auto w-full flex flex-col max-w-xl mb-4 min-h-[288px] justify-evenly gap-1 py-1 text-xs md:text-sm">
            { latestTransactions.length > 0 ?
              latestTransactions.map(tx => (
                <div key={tx.transactionHash}  className="bg-white p-2 mx-2 flex rounded-md">
                  <Image src={concordiumLogo} alt="concordium-logo" className="bg-[--teal] p-2 rounded-md" />
                  <div className="p-2 font-semibold">
                    <p>Date: <span className="font-normal">{formatTimestamp(tx.blockTime)}</span></p>
                    <p>Transaction Hash: <a
                      className="hover:cursor-pointer text-blue-500 font-normal"
                      href={`${process.env.NEXT_PUBLIC_EXPLORER_URL}/transaction/${tx.transactionHash}`}
                      target="_blank"
                    >
                      {formatTxHash(tx.transactionHash)}
                    </a>
                    </p>
                  </div>
                </div>
              )) :
              <p className="absolute inset-0 text-gray-400 text-center place-content-center">No transactions found.</p>
            }
          </div>
        </div>
      </div>
    </main>
    <div className="h-32 w-full bg-[--teal] flex items-center justify-center sm:px-10">
        <Image src={poweredByConcordium} alt="powered by" className="w-64 sm:w-72" />
    </div>
    {error && <ErrorAlert errorText={error} onClose={() => setError(undefined)}/>}
    </div>
  );
}
