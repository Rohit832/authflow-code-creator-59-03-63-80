import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import finsageLogo from '@/assets/finsage-logo.png';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              
              <span className="text-xl font-bold text-primary">Finsage</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/book-demo" className="text-gray-600 hover:text-primary transition-colors">
              Book Demo
            </Link>
            <Link to="/individual-auth" className="text-gray-600 hover:text-primary transition-colors">
              Individual
            </Link>
            <Link to="/client-auth" className="text-gray-600 hover:text-primary transition-colors">
              Client
            </Link>
            <Link to="/admin-auth" className="text-gray-600 hover:text-primary transition-colors">
              Admin
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100">
              <Link to="/book-demo" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Book Demo
              </Link>
              <Link to="/individual-auth" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Individual
              </Link>
              <Link to="/client-auth" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Client
              </Link>
              <Link to="/admin-auth" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md" onClick={() => setIsMenuOpen(false)}>
                Admin
              </Link>
            </div>
          </div>}
      </div>
    </header>;
};
export default Header;