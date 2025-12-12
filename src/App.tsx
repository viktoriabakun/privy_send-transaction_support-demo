import {
	useFundWallet,
	usePrivy,
	useSendTransaction,
	useWallets,
} from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import {
	createPublicClient,
	encodeFunctionData,
	erc20Abi,
	formatUnits,
	http,
} from "viem";
import { arbitrum } from "viem/chains";

import "./App.css";

function App() {
	const [usdcBalance, setUSDCBalance] = useState<bigint>(0n);

	const {
		ready: privyReady,
		authenticated,
		logout,
		login,
		exportWallet,
	} = usePrivy();
	const { wallets, ready: walletsReady } = useWallets();
	const { fundWallet } = useFundWallet();
	const { sendTransaction } = useSendTransaction();

	const privyWallet = wallets?.find((w) => w.walletClientType === "privy");

	function handleDeposit() {
		if (!privyWallet) {
			console.error("privy wallet not found");
			return;
		}

		fundWallet({
			address: privyWallet?.address,
			options: {
				chain: arbitrum,
			},
		});
	}

	// THIS is the function that causes AA23 error
	async function handleWithdraw() {
		if (!walletsReady) {
			console.error("wallets not ready");
			return;
		}

		const recipientAddress = wallets?.find(
			(w) => w.walletClientType !== "privy",
		)?.address;

		if (!recipientAddress) {
			console.error("recipient wallet not found");
			return;
		}

		try {
			const encodeParams = {
				abi: erc20Abi,
				functionName: "transfer",
				args: [recipientAddress as `0x${string}`, usdcBalance],
			} as const;

			const encodedData = encodeFunctionData(encodeParams);

			const txReceipt = await sendTransaction?.(
				{
					to: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC address on Arbitrum
					data: encodedData,
					value: 0n,
				},
				{
					sponsor: true,
				},
			);
			console.log("Withdrawal transaction sent. Hash:", txReceipt.hash);
		} catch (error) {
			console.error("Error during withdrawal:", error);
		}
	}

	useEffect(() => {
		async function getUSDCBalance() {
			const client = createPublicClient({
				chain: arbitrum,
				transport: http(),
			});

			try {
				const res = await client.readContract({
					abi: erc20Abi,
					address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC address on Arbitrum
					functionName: "balanceOf",
					args: [privyWallet?.address as `0x${string}`],
				});

				setUSDCBalance(res);
			} catch (error) {
				console.error(error);
			}
		}

		if (privyReady && walletsReady && privyWallet) {
			getUSDCBalance();
		}
	}, [privyWallet, walletsReady, privyReady]);

	if (!privyReady) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex flex-col gap-4">
			{!authenticated ? (
				<button onClick={login} type="button">
					Connect wallet
				</button>
			) : (
				<>
					<p className="flex items-start flex-col gap-2 text-violet-400 font-bold">
						<span>USDC balance wei: {usdcBalance}</span>
						<span>USDC balance: {formatUnits(usdcBalance, 6)}</span>
					</p>
					<button onClick={handleDeposit} type="button">
						Deposit
					</button>
					<button onClick={handleWithdraw} type="button">
						Withdraw
					</button>

					<button onClick={logout} type="button">
						Disconnect
					</button>
					<button onClick={exportWallet} type="button">
						Export wallet
					</button>
				</>
			)}
		</div>
	);
}

export default App;
