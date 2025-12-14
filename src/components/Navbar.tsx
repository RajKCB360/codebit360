import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { name: "Courses", href: "/#courses" },
  { name: "Internships", href: "/#internships" },
  { name: "Jobs", href: "/jobs", isRoute: true },
  { name: "Services", href: "/#services" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (href: string, isRoute?: boolean) => {
    setIsMobileMenuOpen(false);
    
    // If it's a hash link and we're not on the home page, we need special handling
    if (href.startsWith("/#") && location.pathname !== "/") {
      // The Link component will handle navigation
      return;
    }
  };

  const isActiveRoute = (href: string, isRoute?: boolean) => {
    if (isRoute) {
      return location.pathname === href;
    }
    return false;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              Code<span className="gradient-text">Bit360</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = isActiveRoute(link.href, link.isRoute);
              
              if (link.isRoute) {
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              }
              
              // Handle hash links
              if (location.pathname !== "/") {
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                );
              }
              
              return (
                <a
                  key={link.name}
                  href={link.href.replace("/", "")}
                  className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium transition-all duration-200"
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button 
                    variant={location.pathname === "/dashboard" ? "secondary" : "ghost"} 
                    size="sm"
                    className="font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button 
                      variant={location.pathname === "/admin" ? "secondary" : "outline"} 
                      size="sm"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Log In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="default" size="sm" className="font-medium">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, index) => {
                const isActive = isActiveRoute(link.href, link.isRoute);
                
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-foreground hover:bg-muted/50"
                        }`}
                        onClick={() => handleNavClick(link.href, link.isRoute)}
                      >
                        {link.name}
                      </Link>
                    ) : location.pathname !== "/" ? (
                      <Link
                        to={link.href}
                        className="block px-4 py-3 rounded-lg text-foreground hover:bg-muted/50 font-medium transition-colors"
                        onClick={() => handleNavClick(link.href)}
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href.replace("/", "")}
                        className="block px-4 py-3 rounded-lg text-foreground hover:bg-muted/50 font-medium transition-colors"
                        onClick={() => handleNavClick(link.href)}
                      >
                        {link.name}
                      </a>
                    )}
                  </motion.div>
                );
              })}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-2 pt-4 mt-2 border-t border-border"
              >
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button 
                        variant={location.pathname === "/dashboard" ? "secondary" : "ghost"} 
                        className="w-full justify-start"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button 
                          variant={location.pathname === "/admin" ? "secondary" : "outline"} 
                          className="w-full justify-start"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Admin
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-muted-foreground hover:text-destructive" 
                      onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">Log In</Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
