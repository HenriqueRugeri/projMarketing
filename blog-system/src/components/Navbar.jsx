import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Instagram, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-xl text-gray-800">Blog System</span>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/blog"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/blog') || isActive('/')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-100'
              }`}
            >
              <Home size={18} />
              <span>Blog</span>
            </Link>

            <Link
              to="/instagram"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/instagram')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-100'
              }`}
            >
              <Instagram size={18} />
              <span>Instagram</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    location.pathname.startsWith('/admin') && location.pathname !== '/admin/login'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                  }`}
                >
                  <Settings size={18} />
                  <span>Admin</span>
                </Link>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User size={16} />
                  <span>{user?.username}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Sair</span>
                </Button>
              </div>
            ) : (
              <Link to="/admin/login">
                <Button variant="outline" size="sm">
                  Login Admin
                </Button>
              </Link>
            )}
          </div>

          {/* Botão Menu Mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link
                to="/blog"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/blog') || isActive('/')
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                }`}
              >
                <Home size={18} />
                <span>Blog</span>
              </Link>

              <Link
                to="/instagram"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/instagram')
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                }`}
              >
                <Instagram size={18} />
                <span>Instagram</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      location.pathname.startsWith('/admin') && location.pathname !== '/admin/login'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                    }`}
                  >
                    <Settings size={18} />
                    <span>Admin</span>
                  </Link>

                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600">
                    <User size={16} />
                    <span>Logado como: {user?.username}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2 mx-3"
                  >
                    <LogOut size={16} />
                    <span>Sair</span>
                  </Button>
                </>
              ) : (
                <Link to="/admin/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="mx-3">
                    Login Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
