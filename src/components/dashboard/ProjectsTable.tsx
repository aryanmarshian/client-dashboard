import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2 } from "lucide-react";
import { Project } from "../Dashboard";
import { EditProjectDialog } from "./EditProjectDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  onUpdate: () => void;
}

export const ProjectsTable = ({
  projects,
  loading,
  onUpdate,
}: ProjectsTableProps) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "arrival":
        return "bg-gray-200 text-gray-800";
      case "quoted":
        return "bg-gray-300 text-gray-900";
      case "won":
        return "bg-gray-400 text-gray-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      onUpdate();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No projects found. Add your first project to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    {project.project_name}
                  </TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>{formatCurrency(project.amount)}</TableCell>
                  <TableCell>
                    <Badge className={getStageColor(project.stage)}>
                      {project.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={project.current_progress}
                        className="w-16"
                      />
                      <span className="text-sm text-muted-foreground">
                        {project.current_progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{project.probability}%</TableCell>
                  <TableCell>{formatDate(project.deadline)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProject(project)}
                        title="Edit"
                        className="p-2 bg-transparent hover:bg-white/5 text-foreground border-transparent"
                      >
                        <Edit className="h-4 w-4 text-foreground" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" title="Delete">
                            <Trash2 className="h-4 w-4 text-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "
                              {project.project_name}"? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button
                                className="bg-destructive text-destructive-foreground"
                                onClick={async () => {
                                  await handleDelete(project.id);
                                }}
                              >
                                Delete
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          onSuccess={() => {
            setEditingProject(null);
            onUpdate();
          }}
        />
      )}
    </>
  );
};
