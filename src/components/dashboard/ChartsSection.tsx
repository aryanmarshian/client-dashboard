import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Project } from "../Dashboard";

interface ChartsSectionProps {
  projects: Project[];
}

export const ChartsSection = ({ projects }: ChartsSectionProps) => {
  // Stage Overview Data (normalize to lowercase)
  const stageData = projects.reduce((acc, project) => {
    const s = (project.stage || "").toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stageChartData = Object.entries(stageData).map(([stage, count]) => ({
    stage,
    count,
    fill: getStageColor(stage),
  }));

  // Client Mix Data
  const clientData = projects.reduce((acc, project) => {
    acc[project.client] = (acc[project.client] || 0) + project.amount;
    return acc;
  }, {} as Record<string, number>);

  const clientChartData = Object.entries(clientData).map(
    ([client, amount]) => ({
      client,
      amount,
      fill: getClientColor(client),
    })
  );

  // Cumulative Amount Data (by month)
  const monthlyData = projects.reduce((acc, project) => {
    const month = new Date(project.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + project.amount;
    return acc;
  }, {} as Record<string, number>);

  const cumulativeData = Object.entries(monthlyData)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .reduce((acc, [month, amount], index) => {
      const cumulative =
        index > 0 ? acc[index - 1].cumulative + amount : amount;
      acc.push({ month, amount, cumulative });
      return acc;
    }, [] as Array<{ month: string; amount: number; cumulative: number }>);

  // Key Stages: prefer arrival, quoted, won (derived from DB). Show only those in that order.
  const preferredStages = ["arrival", "quoted", "won"];
  const stageColumnData = preferredStages.map((stageKey) => {
    const stageProjects = projects.filter(
      (p) => (p.stage || "").toLowerCase() === stageKey
    );
    return {
      stage: stageKey,
      display: stageKey.charAt(0).toUpperCase() + stageKey.slice(1),
      count: stageProjects.length,
      value: stageProjects.reduce((sum, p) => sum + p.amount, 0),
      avgProbability:
        stageProjects.length > 0
          ? stageProjects.reduce((sum, p) => sum + p.probability, 0) /
            stageProjects.length
          : 0,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace(/\u00A0/g, " ");
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Top Row: Stage Overview & Client Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Stage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <Pie
                  data={stageChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {stageChartData.map((entry) => (
                <div key={entry.stage} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.stage.charAt(0).toUpperCase() + entry.stage.slice(1)}{" "}
                    ({entry.count})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <Pie
                  data={clientChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="amount"
                >
                  {clientChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [
                        formatCurrency(value as number),
                        "Value",
                      ]}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {clientChartData.slice(0, 5).map((entry) => (
                <div key={entry.client} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.client}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Cumulative Amount & Stage Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px]">
              <AreaChart data={cumulativeData}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="rgba(0,0,0,0.6)"
                  fill="rgba(0,0,0,0.06)"
                  fillOpacity={1}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [
                        formatCurrency(value as number),
                        "Cumulative",
                      ]}
                    />
                  }
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {stageColumnData.map((stage) => (
                <div
                  key={stage.stage}
                  className="text-center p-4 border rounded-lg"
                >
                  <h4 className="font-semibold text-sm mb-2">
                    {stage.display}
                  </h4>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{stage.count}</div>
                    <div className="text-sm text-muted-foreground">
                      Projects
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatCurrency(stage.value)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stage.avgProbability.toFixed(0)}% avg prob.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function getStageColor(stage: string): string {
  const map: Record<string, string> = {
    arrival: "hsl(var(--stage-arrival))",
    quoted: "hsl(var(--stage-quoted))",
    won: "hsl(var(--stage-won))",
    completed: "hsl(0 0% 70%)",
    lost: "hsl(0 0% 60%)",
  };
  return map[stage.toLowerCase()] || "hsl(var(--muted))";
}

function getClientColor(client: string): string {
  const personTokens = [
    "--person-1",
    "--person-2",
    "--person-3",
    "--person-4",
    "--person-5",
    "--person-6",
    "--person-7",
  ];
  // deterministic hash of string -> index
  let h = 0;
  for (let i = 0; i < client.length; i++) {
    h = (h << 5) - h + client.charCodeAt(i);
    h |= 0;
  }
  const idx = Math.abs(h) % personTokens.length;
  return `hsl(var(${personTokens[idx]}))`;
}
