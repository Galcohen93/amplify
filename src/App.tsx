import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

"use client";
const client = generateClient<Schema>();

type DashboardEntry = {
  jitter_median: number;
  sysTime: string;
};

function App() {
  const { user, signOut } = useAuthenticator();
  const [dashboardData, setDashboardData] = useState<DashboardEntry[]>([]);


  
  useEffect(() => {
    client.models.realtimeDashboard.list().then((result: { data: { sysTime: string, jitter_median: string, device_id: string }[] }) => {
      const data = result.data || [];

      const filteredData = data
        .filter((item) => item.device_id === "1") // Ensure `device_id` is a string for comparison
        .map((item) => ({
          jitter_median: parseFloat(item.jitter_median), // Convert string to number for charting
          sysTime: item.sysTime,
        }));

      setDashboardData(filteredData);
    }).catch((error: Error) => console.error("Error fetching dashboard data:", error));
  }, []);

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s Real-Time Dashboard</h1>
      <div style={{ width: '100%', height: 300 }}>
        <h2>Real-Time Jitter Median Dashboard</h2>
        <ResponsiveContainer>
          <LineChart data={dashboardData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sysTime" />
            <YAxis dataKey="jitter_median" />
            <Tooltip />
            <Line type="monotone" dataKey="jitter_median" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
