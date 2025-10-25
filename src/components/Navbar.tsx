import { Heart, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { storage, api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  const location = useLocation();
  const user = storage.getUser();
  const { toast } = useToast();
  
  const links = [
    { href: "/", label: "Home" },
    { href: "/#features", label: "Features" },
    { href: "/#about", label: "About" },
  ];

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await api.logout();
      
      // Clear local session data
      storage.clearUser();
      
      // Show success message
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      // Even if backend logout fails, clear local session
      storage.clearUser();
      window.location.href = "/";
    }
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <Heart className="text-accent" fill="currentColor" />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              FitSense
            </span>
          </Link>
          
          <div className="flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </a>
            ))}
            
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.name}
                </span>
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button
                  variant="outline"
                  className="border-primary/20 hover:bg-primary/10"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
