import Image from "next/image"
import logo from "../../../assets/CookconneKt 1.png"
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa"
import { FaSquareInstagram, FaXTwitter } from "react-icons/fa6"
import { IoLogoYoutube } from "react-icons/io"
import { MdEmail, MdPhone } from "react-icons/md"

const Footer = () => {
  return (
    <footer className="bg-[#2D2D2D] text-white py-12 px-5">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Logo and Description */}
          <div className="flex flex-col">
            <div className="mb-6">
              <Image
                src={logo || "/placeholder.svg"}
                alt="CookconneKt Logo"
                width={500}
                height={500}
                className="object-contain w-[100px] h-[100px]"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              The platform that connects professional chefs with restaurants and catering establishments in Morocco.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/aboutUs" className="text-gray-300 hover:text-white transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contactUs" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacyPolicy" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Support</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MdEmail className="text-gray-400 text-lg" />
                <a
                  href="mailto:support@cookconnekt.ma"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  support@cookconnekt.ma
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MdPhone className="text-gray-400 text-lg" />
                <p  className="text-gray-300 hover:text-white transition-colors text-sm">
                  +212 5 22 XX XX XX
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8">
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaFacebookF className="text-lg" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaSquareInstagram className="text-lg" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaXTwitter className="text-lg" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaLinkedinIn className="text-lg" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <IoLogoYoutube className="text-lg" />
                </a>
              </div>
            </div>
          </div>
        </div>

      
      </div>
    </footer>
  )
}

export default Footer
