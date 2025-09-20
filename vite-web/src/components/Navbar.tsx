import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <nav className="sticky top-0 w-full bg-[rgba(0,0,0,0.05)] backdrop-blur-md z-50">
      <div className="flex justify-end items-center h-14 p-3 md:px-5">
        <ConnectButton accountStatus="avatar" />
      </div>
    </nav>
  );
}
