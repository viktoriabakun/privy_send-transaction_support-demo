import { PrivyProvider } from "@privy-io/react-auth";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { arbitrum } from "viem/chains";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<PrivyProvider
			appId="cmgkjyeob00uhju0cwzeeilxd"
			config={{
				loginMethods: ["wallet"],
				supportedChains: [arbitrum],
				defaultChain: arbitrum,
				embeddedWallets: {
					ethereum: {
						createOnLogin: "all-users",
					},
				},
				appearance: {
					showWalletLoginFirst: true,
					theme: "light",
				},
			}}
		>
			<App />
		</PrivyProvider>
	</StrictMode>,
);
