import { Button } from "@/components/ui/button";
import { Plus, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { LoginDialog } from "./LoginDialog";
import { useAdmin } from "@/hooks/use-admin";

interface DashboardHeaderProps {
  onAddProject: () => void;
}

export const DashboardHeader = ({ onAddProject }: DashboardHeaderProps) => {
  const { isAdmin, logout } = useAdmin();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="border-b header-glass">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">BidSight</h1>
            <span className="text-sm text-muted-foreground">
              Projects Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <>
                <Button onClick={onAddProject}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
                <Button variant="ghost" onClick={() => logout()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setLoginOpen(true)}>
                <LogIn className="h-4 w-4 mr-2" />
                Admin Login
              </Button>
            )}
          </div>
        </div>
      </div>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </header>
  );
};
