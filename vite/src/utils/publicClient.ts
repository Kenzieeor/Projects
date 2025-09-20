import { createPublicClient, http } from "viem";
import { cronosTestnet } from "viem/chains";

const defaultChain = cronosTestnet;

export const publicClient = createPublicClient({
  chain: defaultChain,
  transport: http(),
});
