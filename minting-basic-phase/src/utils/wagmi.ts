import { createConfig, http } from "wagmi";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  rainbowWallet,
  walletConnectWallet,
  metaMaskWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { cronosTestnet } from "wagmi/chains";
import { defiWallet } from "./myDefiWallet";

const projectId = "8d0fa9079fc8cf506013a3e0cc1f968a";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, defiWallet],
    },
    {
      groupName: "Popular",
      wallets: [rainbowWallet, walletConnectWallet, coinbaseWallet],
    },
  ],
  {
    appName: "Brave",
    projectId,
  }
);

const customRpcUrl = "https://evm-t3.cronos.org";

export const wagmiConfig = createConfig({
  connectors,
  chains: [cronosTestnet],
  transports: {
    [cronosTestnet.id]: http(customRpcUrl),
  },
  ssr: false,
});
