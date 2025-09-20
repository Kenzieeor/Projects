import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <nav className="sticky top-0 w-full bg-black/100 z-50">
      <div className="flex justify-between items-center h-14 px-3 md:px-5">
        <div></div>
        <ConnectButton accountStatus="avatar" />
      </div>
    </nav>
  );
}
