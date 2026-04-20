"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function PaymentsChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value.toLocaleString()}`}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(29, 158, 117, 0.1)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 border rounded shadow-sm">
                    <p className="text-sm font-bold">{payload[0].payload.name}</p>
                    <p className="text-sm text-primary">{payload[0].value?.toLocaleString()} FCFA</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="total" 
            fill="var(--color-primary)" 
            radius={[4, 4, 0, 0]} 
            className="fill-primary"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
