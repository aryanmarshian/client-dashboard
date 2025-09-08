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
  Legend,
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
    const clientName = project.client || "Unknown";
    acc[clientName] = (acc[clientName] || 0) + (project.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  // Convert to array and sort descending by amount
  const clientEntries = Object.entries(clientData)
    .map(([client, amount]) => ({
      client,
      amount,
      fill: getClientColor(client),
    }))
    .sort((a, b) => b.amount - a.amount);

  // Aggregate all clients that are 1% or less of the total into an "Other" bucket
  const totalClientAmount = clientEntries.reduce((s, e) => s + e.amount, 0);
  const threshold = totalClientAmount * 0.01; // 1%

  let othersAmount = 0;
  const majorClients: Array<{ client: string; amount: number; fill: string }> =
    [];

  for (const entry of clientEntries) {
    if (totalClientAmount > 0 && entry.amount <= threshold) {
      othersAmount += entry.amount;
    } else {
      majorClients.push(entry);
    }
  }

  if (othersAmount > 0) {
    majorClients.push({
      client: "Other",
      amount: othersAmount,
      fill: "hsl(var(--muted))",
    });
  }

  const clientChartData = majorClients;

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
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Top Row: Stage Overview & Client Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Stage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[300px]"
            >
              {/* compute total for percent labels */}
              {(() => {
                const total = stageChartData.reduce((s, d) => s + d.count, 0);
                const legendPayload = stageChartData.map((d) => ({
                  value: d.stage.charAt(0).toUpperCase() + d.stage.slice(1),
                  type: "square" as any,
                  color: d.fill,
                })) as any;

                return (
                  <PieChart>
                    <Legend
                      //verticalAlign="top"
                      align="center"
                      payload={legendPayload}
                    />
                    <Pie
                      data={stageChartData}
                      cx="50%"
                      cy="52%"
                      innerRadius={Math.round(140 * 0.35)}
                      outerRadius={Math.round(140 * 0.7)}
                      paddingAngle={6}
                      dataKey="count"
                      stroke="#fff"
                      strokeWidth={1}
                      labelLine={true}
                      label={({ name, percent, index }) => {
                        const entry = stageChartData[index];
                        return `${Math.round(percent * 100)}%`;
                      }}
                    >
                      {stageChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          stroke="#fff"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                );
              })()}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Client Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{}}
              className="mx-auto aspect-square max-h-[500px]"
            >
              {(() => {
                const total = clientChartData.reduce((s, d) => s + d.amount, 0);
                return (
                  <PieChart>
                    <Pie
                      data={clientChartData}
                      cx="50%"
                      cy="52%"
                      innerRadius={Math.round(0 * 0.2)}
                      outerRadius={Math.round(180 * 0.75)}
                      paddingAngle={4}
                      dataKey="amount"
                      nameKey="client"
                      stroke="#fff"
                      strokeWidth={1}
                      labelLine={true}
                      label={({ name, percent, index }) => {
                        // hide the name for the aggregated "Other" slice, show only percent
                        const entry = clientChartData[index];
                        if (entry && entry.client === "Other") {
                          return `${Math.round((percent || 0) * 100)}%`;
                        }
                        return `${name} ${Math.round((percent || 0) * 100)}%`;
                      }}
                    >
                      {clientChartData.map((entry, index) => (
                        <Cell
                          key={`cell-client-${index}`}
                          fill={entry.fill}
                          stroke="#fff"
                        />
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
                );
              })()}
            </ChartContainer>
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
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Projects & Won Projects Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {projects.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Won Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {
                projects.filter((p) => (p.stage || "").toLowerCase() === "won")
                  .length
              }
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
  const colorPalette = [
    "hsla(210, 38%, 49%, 1.00)", // Muted Blue
    "hsl(120, 30%, 40%)", // Muted Green
    //"hsla(0, 41%, 47%, 1.00)", // Muted Red
    "hsla(45, 40%, 50%, 1.00)", // Muted Yellow
    //"hsla(270, 53%, 50%, 1.00)", // Muted Purple
    "hsl(300, 30%, 40%)", // Muted Pink
    "hsla(180, 42%, 47%, 1.00)", // Muted Cyan
    "hsla(200, 20%, 35%, 1.00)", // Slate Blue-Grey
    "hsla(25, 35%, 45%, 1.00)", // Warm Brown
    "hsla(160, 25%, 38%, 1.00)", // Teal Green
    "hsla(340, 30%, 45%, 1.00)", // Deep Rose
    "hsla(50, 25%, 55%, 1.00)", // Sand / Beige
    "hsla(220, 25%, 25%, 1.00)", // Navy
    "hsla(0, 0%, 40%, 1.00)", // Neutral Grey
  ];

  // Deterministic hash of string -> index
  let h = 0;
  for (let i = 0; i < client.length; i++) {
    h = (h << 5) - h + client.charCodeAt(i);
    h |= 0;
  }
  const idx = Math.abs(h) % colorPalette.length;
  return colorPalette[idx];
}
