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

interface RealtimeDashboardItem {
  sysTime: string;
  device_id: number;
  jitter_median: number;
  // Other fields can be added as needed
}

function App() {
  const { user, signOut } = useAuthenticator();
  const [dashboardData, setDashboardData] = useState<DashboardEntry[]>([]);

  useEffect(() => {
    // Fetch data from the realtimeDashboard table with device_id = 1
    client.models.realtimeDashboard.list().then((result) => {
      const data = (result?.data as RealtimeDashboardItem[]) || [];

      // Filter for device_id = 1 and map to the desired structure
      const filteredData = data
        .filter((item) => item.device_id === 1)
        .map((item) => ({
          jitter_median: item.jitter_median,
          sysTime: item.sysTime,
        }));

      setDashboardData(filteredData);
    }).catch(error => console.error("Error fetching dashboard data:", error));
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
