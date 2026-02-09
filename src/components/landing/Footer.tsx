import Link from 'next/link';
import { Heart } from 'lucide-react';

const footerLinks = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Security', href: '#' },
    { name: 'Mobile App', href: '#' },
  ],
  Company: [
    { name: 'About Us', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Press', href: '#' },
  ],
  Support: [
    { name: 'Help Center', href: '#' },
    { name: 'Contact Us', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-text text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <span className="font-semibold text-lg">CareCircle</span>
            </Link>
            <p className="text-gray-400 text-sm mb-3 sm:mb-4">
              Simple, affordable care coordination for families.
            </p>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Heart className="w-4 h-4 text-red-400" />
              Made with care
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{category}</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-6 sm:pt-8 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left">
            © {new Date().getFullYear()} CareCircle. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
