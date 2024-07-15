import Image from "next/image";
import { IBM_Plex_Mono } from "next/font/google";
import poweredByConcordium from "../../public/powered_by_concordium_light.png";
import { useEffect, useState } from "react";
import { SingleInputForm } from "@/components/SingleInpuForm";
import { extractITweetdFromUrl, formatTimestamp, formatTxHash } from "@/lib/utils";
import { ErrorAlert } from "@/components/ErrorAlert";
import getLatestTransactions from "@/lib/getLatestTransactions";
import { AccountAddress } from "@concordium/web-sdk";

const IBMPlexMono = IBM_Plex_Mono({ weight: ["400", "600", "700"], subsets: ["latin"], display: "swap", variable: "--font-ibm-plex-mono"});


export default function Home() {
  const [latestTransactions, setLatestTransactions] = useState<PartialTransaction[]>([]);
  const [address, setAddress] = useState<string>("");
  const [addressValidationError, setAddressValidationError] = useState<string | undefined>();

  const [tweetPostedUrl, setTweetPostedUrl] = useState('');
  const [tweetPostedId, setTweetPostedId] = useState<string | undefined>();

  const [isValidTweetUrl, setIsValidTweetUrl] = useState<boolean | undefined>();
  const [isValidVerification, setIsValidVerification] = useState<boolean | undefined>();
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  
  const [error, setError] = useState<string | undefined>();

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

  const handlePostTweet = () => {
    // const tweetTemplate = encodeURIComponent(`Excited to use testnet faucet! 🚀 Requesting 20,000 CCDs to power my blockchain experiments. ${address} Check it out! #Concordium #Blockchain #Testnet #Developers`);
    const tweetTemplate = encodeURIComponent(`testing ${address} testing`)
    window.open(`https://x.com/intent/tweet?text=${tweetTemplate}`, '_blank', 'width=500,height=500');
  };

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
    try {
      const { ok: verifyOk, data: verifyData } = await verifyTweet();
  
      if (verifyOk) {
        setIsValidVerification(verifyData.isValid);
        await new Promise(resolve => setTimeout(() => resolve, 2000))
        const { ok: sendOk, data: sendData } = await sendTokens();
  
        if (sendOk) {
          setTransactionHash(sendData.transactionHash);
        } else {
          setError(sendData.error);
        }
      } else {
        setIsValidVerification(false);
        setError(verifyData.error);
      }
    } catch (error: any) {
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
    <main
      className={`flex min-h-screen flex-col items-center justify-between ${IBMPlexMono.className}`}
    >
      <div className="h-24 w-full bg-[--teal] flex items-center justify-center sm:justify-between sm:px-10">
        <p className="text-xl sm:text-2xl text-center font-semibold text-white">Concordium Testnet Faucet</p>
      </div>
      <div className="flex-1 flex flex-col items-center w-full gap-4 px-4 py-8 sm:p-14 text-sm sm:text-base">
        <p className="mb-4">Get free CDDs for testing your dApps!</p>
        <div className="border border-[--dark-blue] rounded-full h-9 w-9 flex items-center justify-center">
          <p className="font-semibold">1</p>
        </div>  
        <SingleInputForm
          inputValue={address}
          handleInputValue={handleAddressChange}
          handleSubmitButton={handlePostTweet}
          inputPlaceHolder="Enter your testnet CCD address"
          submitButtonText="Post Tweet"
          inputDisabled={Boolean(tweetPostedUrl)}
          submitButtonDisabled={!address || (address && Boolean(addressValidationError)) || Boolean(tweetPostedUrl)}
        />
        {addressValidationError && (
          <p className="text-xs text-red-700 h-fit -mt-2">{addressValidationError}</p>
        )}
        <div className="border border-[--dark-blue] rounded-full h-9 w-9 flex items-center justify-center mt-4">
          <p className="font-semibold">2</p>
        </div>
        <SingleInputForm
          inputValue={tweetPostedUrl}
          handleInputValue={handleTweetUrlChange}
          handleSubmitButton={handleVerifyTweetAndSendTokens}
          inputPlaceHolder="Enter your tweet link"
          submitButtonText="Verify"
          inputDisabled={!address || Boolean(addressValidationError) || isValidVerification}
          submitButtonDisabled={!isValidTweetUrl || isValidVerification}
        />
        <div className="border border-[--dark-blue] rounded-full h-9 w-9 flex items-center justify-center mt-4">
          <p className="font-semibold">3</p>
        </div>
        <div className="w-full flex flex-col border border-[--dark-blue] max-w-xl mb-4 p-2 px-4 items-center justify-center min-h-[160px] text-xs sm:text-sm text-center overflow-auto">
        {isValidVerification ? (
          <>
            <p>Tweet Verified Succesfully ✅</p>
            { !transactionHash ? <p>Sending token to your address..</p> : <>
              <p>Tokens sent ✅.</p>
              <p>Tx Hash: {transactionHash}</p>
            </>}
          </>
          ) : <p>Pending to verify.</p>}
          </div>
        <p className="mt-8">Latest transactions:</p>
        <div className="bg-white relative border border-[--dark-blue] overflow-auto w-full flex flex-col max-w-xl mb-4 min-h-[288px] text-xs sm:text-sm">
          { latestTransactions.length > 0 ?
            latestTransactions.map(tx => (
              <div key={tx.transactionHash}  className="border-b last:border-none py-2 text-nowrap">
                <p>{`Date: ${formatTimestamp(tx.blockTime)}`}</p>
                <p>{`Tx Hash: ${tx.transactionHash}`}</p>
              </div>
            )) :
            <p className="absolute inset-0 text-gray-400 text-center place-content-center">No transactions found.</p>
          }
        </div>
      </div>
      <div className="h-32 w-full bg-[--blue-sapphire] flex items-center justify-center sm:px-10">
        <Image src={poweredByConcordium} alt="powered by" className="w-72" />
      </div>
      {error && <ErrorAlert
        errorText={error}
        onClose={() => setError(undefined)}
      />}

    </main>
  );
}
