"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SkillsRadarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#444" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#FFF', fontSize: 14 }} />
        
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 5]} 
          tickCount={6} 
          tick={{ fill: '#999', fontSize: 0 }} 
          axisLine={false}
        />
        
        <Tooltip
          contentStyle={{
            backgroundColor: '#202831',
            borderColor: '#444',
            color: '#fff',
            borderRadius: '8px'
          }}
          formatter={(value) => `${value} / 5`}
        />
        <Radar name="Média" dataKey="score" stroke="#5bca6cff" fill="#3fb951" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}