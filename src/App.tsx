import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

"use client";
const client = generateClient<Schema>();

type AlarmHistoryEntry = {
  status: number;
  createdAt: string;
};

interface AlarmItem {
  status: boolean | null;
  id: string;
  createdAt: string;
  updatedAt: string;
}

function App() {
  const { user, signOut } = useAuthenticator();
  const [alarmStatus, setAlarmStatus] = useState<boolean>(false);
  const [alarmId, setAlarmId] = useState<string | null>(null);
  const [alarmHistory, setAlarmHistory] = useState<AlarmHistoryEntry[]>([]);

  useEffect(() => {
    // Fetch Alarm history data for the dashboard
    client.models.Alarm.list().then((result) => {
      // Ensure result.data exists and is an array
      const data = (result?.data as AlarmItem[]) || [];

      // Sort the data by createdAt in ascending order
      const sortedData = data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Map the sorted data to the structure needed for the chart
      const history = sortedData.map((item) => ({
        status: item.status ? 1 : 0, // Convert boolean to number for y-axis
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A", // Handle nullable createdAt
      }));
      setAlarmHistory(history);

      // Set the latest alarm status and ID if data is present
      if (sortedData.length > 0) {
        const latestAlarm = sortedData[sortedData.length - 1];
        setAlarmStatus(latestAlarm.status ?? false); // Provide default value if status is null
        setAlarmId(latestAlarm.id);
      }
    }).catch(error => console.error("Error fetching alarm history:", error));
  }, []);
  
  // Toggle Alarm status
  function toggleAlarm() {
    const newStatus = !alarmStatus;
    setAlarmStatus(newStatus);

    // Update existing alarm entry if it exists
    if (alarmId) {
      client.models.Alarm.update({ id: alarmId, status: newStatus }).then((updatedAlarm) => {
        const updatedItem = updatedAlarm.data as AlarmItem;
        setAlarmHistory((prevHistory) => [
          ...prevHistory,
          { status: newStatus ? 1 : 0, createdAt: updatedItem.createdAt ? new Date(updatedItem.createdAt).toLocaleString() : "N/A" },
        ]);
      }).catch(error => {
        console.error("Error updating alarm status:", error);
        alert("Failed to update alarm status.");
      });
    } else {
      // If no alarmId, create a new entry
      client.models.Alarm.create({ status: newStatus }).then((newAlarm) => {
        const newItem = newAlarm.data as AlarmItem;
        setAlarmId(newItem.id);
        setAlarmHistory((prevHistory) => [
          ...prevHistory,
          { status: newStatus ? 1 : 0, createdAt: newItem.createdAt ? new Date(newItem.createdAt).toLocaleString() : "N/A" },
        ]);
      }).catch(error => {
        console.error("Error creating alarm status:", error);
        alert("Failed to create alarm status.");
      });
    }
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s Alarm Dashboard</h1>
      <div>
        <button onClick={toggleAlarm}>
          Alarm {alarmStatus ? "ON" : "OFF"}
        </button>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <h2>Real-Time Alarm Status Dashboard</h2>
        <ResponsiveContainer>
          <LineChart data={alarmHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="createdAt" />
            <YAxis dataKey="status" domain={[0, 1]} tickFormatter={(value: number) => (value ? "ON" : "OFF")} />
            <Tooltip />
            <Line type="monotone" dataKey="status" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <br />
        <br />
        <a href="https://www.waving.ai">
          Waving.ai - Learn more
          <br />
          <br />
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
