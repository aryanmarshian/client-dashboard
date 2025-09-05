import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "../Dashboard";
import { DollarSign, TrendingUp, Clock, Target } from "lucide-react";

interface StatsCardsProps {
  projects: Project[];
}

export const StatsCards = ({ projects }: StatsCardsProps) => {
  const totalValue = projects.reduce((sum, project) => sum + project.amount, 0);
  const totalWonValue = projects
    .filter((p) => (p.stage || "").toLowerCase() === "won")
    .reduce((sum, project) => sum + project.amount, 0);
  const avgProbability =
    projects.length > 0
      ? projects.reduce((sum, project) => sum + project.probability, 0) /
        projects.length
      : 0;
  const completedProjects = projects.filter(
    (p) => p.stage === "Completed"
  ).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace(/\u00A0/g, " ");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Pipeline Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value Won</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalWonValue)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Avg. Win Probability
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgProbability.toFixed(0)}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Completed Projects
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedProjects}</div>
        </CardContent>
      </Card>
    </div>
  );
};
