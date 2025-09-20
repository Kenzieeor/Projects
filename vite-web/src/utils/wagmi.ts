import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Brave",
  projectId: "8d0fa9079fc8cf506013a3e0cc1f968a",
  chains: [sepolia],
  ssr: false,
});
