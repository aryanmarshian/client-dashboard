import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Project } from "../Dashboard";

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditProjectDialog = ({
  project,
  open,
  onOpenChange,
  onSuccess,
}: EditProjectDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    project_name: "",
    client: "",
    amount: "",
    deadline: "",
    probability: "",
    current_progress: "",
    stage: "",
    description: "",
    project_owner: "",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name,
        client: project.client,
        amount: project.amount.toString(),
        deadline: project.deadline,
        probability: project.probability.toString(),
        current_progress: project.current_progress.toString(),
        stage: project.stage,
        description: project.description || "",
        project_owner: project.project_owner,
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          project_name: formData.project_name,
          client: formData.client,
          amount: parseFloat(formData.amount),
          deadline: formData.deadline,
          probability: parseInt(formData.probability),
          current_progress: parseInt(formData.current_progress),
          stage: formData.stage?.toLowerCase(),
          description: formData.description,
          project_owner: formData.project_owner,
        })
        .eq("id", project.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project updated successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border border-border rounded-xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg font-semibold text-white">
            Edit Project
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="project_name"
                className="text-sm text-foreground/90"
              >
                Project Name *
              </Label>
              <Input
                id="project_name"
                value={formData.project_name}
                onChange={(e) =>
                  setFormData({ ...formData, project_name: e.target.value })
                }
                required
                className="bg-transparent border border-border text-foreground placeholder:text-foreground/60"
              />
            </div>
            <div>
              <Label htmlFor="client" className="text-sm text-foreground/90">
                Client *
              </Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) =>
                  setFormData({ ...formData, client: e.target.value })
                }
                required
                className="bg-transparent border border-border text-foreground placeholder:text-foreground/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="text-sm text-foreground/90">
                Amount ($) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
                className="bg-transparent border border-border text-foreground placeholder:text-foreground/60"
              />
            </div>
            <div>
              <Label
                htmlFor="project_owner"
                className="text-sm text-foreground/90"
              >
                Project Owner *
              </Label>
              <Input
                id="project_owner"
                value={formData.project_owner}
                onChange={(e) =>
                  setFormData({ ...formData, project_owner: e.target.value })
                }
                required
                className="bg-transparent border border-border text-foreground placeholder:text-foreground/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deadline" className="text-sm text-foreground/90">
                Deadline *
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                required
                className="bg-transparent border border-border text-foreground placeholder:text-foreground/60"
              />
            </div>
            <div>
              <Label htmlFor="stage" className="text-sm text-foreground/90">
                Stage *
              </Label>
              <Select
                value={formData.stage}
                onValueChange={(value) =>
                  setFormData({ ...formData, stage: value })
                }
              >
                <SelectTrigger className="bg-transparent border border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arrival">Arrival</SelectItem>
                  <SelectItem value="Quoted">Quoted</SelectItem>
                  <SelectItem value="Won">Won</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="probability"
                className="text-sm text-foreground/90"
              >
                Win Probability (%) *
              </Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) =>
                  setFormData({ ...formData, probability: e.target.value })
                }
                required
                className="bg-transparent border border-border text-foreground placeholder:text-foreground/60"
              />
            </div>
            <div>
              <Label
                htmlFor="current_progress"
                className="text-sm text-foreground/90"
              >
                Progress (%) *
              </Label>
              <Input
                id="current_progress"
                type="number"
                min="0"
                max="100"
                value={formData.current_progress}
                onChange={(e) =>
                  setFormData({ ...formData, current_progress: e.target.value })
                }
                required
                className="bg-transparent border border-border text-foreground placeholder:text-foreground/60"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm text-foreground/90">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="bg-transparent border border-border text-foreground placeholder:text-foreground/60"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-foreground/90 border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full"
            >
              {loading ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
