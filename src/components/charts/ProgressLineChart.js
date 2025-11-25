"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProgressLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="date" tick={{ fill: '#FFF', fontSize: 12 }} />
        <YAxis domain={[0, 5]} tick={{ fill: '#FFF', fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#202831',
            borderColor: '#444',
            color: '#fff',
            borderRadius: '8px'
          }}
          labelStyle={{ fontWeight: 'bold' }}
          formatter={(value) => `${value} / 5`}
        />
        <Line type="monotone" dataKey="averageScore" name="Nota Média" stroke="#3fb951" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}