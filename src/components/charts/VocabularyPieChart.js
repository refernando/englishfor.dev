"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = {
    'Basic': '#3d85de',
    'Intermediate': '#3fb850',
    'Advanced': '#f78167'
};

export default function VocabularyPieChart({ data }) {
  const formattedData = data.map(item => ({
      ...item,
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip
          contentStyle={{
            backgroundColor: '#202831',
            borderColor: '#444',
            color: '#fff',
            borderRadius: '8px'
          }}
          itemStyle={{ color: '#fff' }}
          formatter={(value, name) => [`${value} respostas`, name]}
        />
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}