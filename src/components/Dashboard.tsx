import { useState, useEffect } from "react";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { StatsCards } from "./dashboard/StatsCards";
import { ChartsSection } from "./dashboard/ChartsSection";
import { ProjectsTable } from "./dashboard/ProjectsTable";
import { AddProjectDialog } from "./dashboard/AddProjectDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  project_name: string;
  client: string;
  quote_number?: string;
  received_date?: string;
  amount: number;
  deadline: string;
  probability: number;
  current_progress: number;
  stage: string;
  description?: string;
  project_owner: string;
  created_at: string;
  updated_at: string;
}

import { AdminProvider } from "@/hooks/use-admin";

export const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      // Request explicit columns to avoid quoted/encoded column issues in the REST URL
      const { data, error, status } = await supabase
        .from("projects")
        .select(
          `id,project_name,client,quote_number,received_date,amount,deadline,probability,current_progress,stage,description,project_owner,user_id,created_at,updated_at`
        )
        .order("created_at", { ascending: false });

      // detailed debug logging
      console.debug("Supabase fetchProjects status:", status);
      console.debug("Supabase fetchProjects error:", error);
      console.debug("Supabase fetchProjects data:", data);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      // surface more info to the user when available
      const message = (error as any)?.message || JSON.stringify(error);
      toast({
        title: "Error fetching projects",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = () => {
    fetchProjects();
    setIsAddDialogOpen(false);
  };

  const handleUpdateProject = () => {
    fetchProjects();
  };

  return (
    <AdminProvider>
      <div className="min-h-screen">
        <DashboardHeader onAddProject={() => setIsAddDialogOpen(true)} />
        <main className="container mx-auto px-6 py-8 space-y-4">
          <StatsCards projects={projects} />
          <ChartsSection projects={projects} />
          <ProjectsTable
            projects={projects}
            loading={loading}
            onUpdate={handleUpdateProject}
          />
        </main>
        <AddProjectDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={handleAddProject}
        />
      </div>
    </AdminProvider>
  );
};
