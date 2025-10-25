import React from 'react';
import { motion } from 'framer-motion';
import { User, Activity, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { storage, api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SidebarProps {
  user: any;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
    },
    {
      id: 'profile',
      label: 'Your Profile',
      icon: User,
      path: '/profile',
    },
    {
      id: 'exercises',
      label: 'Your Exercises',
      icon: Activity,
      path: '/exercises',
    },
  ];

  const handleLogout = async () => {
    try {
      await api.logout();
      storage.clearUser();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    } catch (error) {
      storage.clearUser();
      navigate('/');
    }
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 z-40"
    >
      <div className="p-6">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FitSense
          </h1>
        </div>

        {/* User Info */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-12",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12 text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
