import { useState } from "react";
import { FiX, FiMenu, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const desktopLinks = [
    { name: "gallery", path: "/galery" },
    { name: "royalties", path: "/royalties" },
  ];

  const toggleDesktopMenu = () => setOpen(!open);
  const toggleMobileMenu = () => setOpenMobile(!openMobile);
  const toggleDropDown = () => setOpenDropdown(!openDropdown);

  return (
    <nav className="sticky top-0 w-full bg-black/100 z-50">
      <div className="flex justify-between items-center px-2 md:px-5 h-16">
        {/* Desktop Menu */}
        <div className="hidden md:flex">
          <a
            href="/"
            className="flex items-center  px-4 py-2 rounded-md hover:bg-white/10 transition duration-300 text-lg font-semibold"
          >
            Mint
          </a>

          <div className="ml-5">
            <button
              onClick={toggleDesktopMenu}
              className={`flex items-center px-4 py-2 gap-1 capitalize cursor-pointer rounded-md transition duration-300 text-lg font-semibold ${
                open ? "bg-white/15" : "hover:bg-white/10"
              }`}
            >
              Ninja fu
              <FiChevronDown
                size={20}
                className={`transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Desktop Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -30 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -30 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 w-45 bg-gray-950 rounded shadow-lg p-2 space-y-3 overflow-hidden"
                >
                  {desktopLinks.map((item, index) => (
                    <a
                      key={index}
                      href={item.path}
                      className="flex items-center capitalize hover:text-white/50 transition duration-300 text-[20px]"
                    >
                      {item.name}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <motion.button
            onClick={toggleMobileMenu}
            className="cursor-pointer rounded p-2 transition-colors duration-200"
            whileTap={{ backgroundColor: "rgba(0, 238, 255, 0.886)" }}
            style={{ backgroundColor: "transparent" }}
          >
            {openMobile ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>

        {/* Connect Button */}
        <ConnectButton accountStatus="avatar" />
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {openMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 85 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
          >
            {/* Mint */}
            <a
              href="/"
              className="flex flex-col ml-5 py-2 capitalize font-semibold text-[18px]"
            >
              Mint
            </a>

            {/* Brave Dog Dropdown */}
            <div>
              <button
                onClick={toggleDropDown}
                className={`flex items-center ml-3 px-2 py-1 rounded capitalize font-semibold gap-1 text-lg ${
                  openDropdown ? "bg-white/10" : ""
                }`}
              >
                Ninja fu
                <FiChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${
                    openDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: -30 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full bg-gray-950 text-lg rounded ml-3 mt-1 w-45 overflow-hidden space-y-3 p-2"
                  >
                    {desktopLinks.map((item, index) => (
                      <a
                        key={index}
                        href={item.path}
                        className="flex items-center capitalize text-[18px]"
                      >
                        {item.name}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
