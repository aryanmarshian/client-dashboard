import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  onAddProject: () => void;
}

export const DashboardHeader = ({ onAddProject }: DashboardHeaderProps) => {
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
          <Button onClick={onAddProject}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>
    </header>
  );
};
