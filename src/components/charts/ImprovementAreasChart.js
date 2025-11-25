"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const translationMap = {
  'SubjectVerbAgreement': 'Concordância',
  'PrepositionChoice': 'Uso de Preposições',
  'ArticleUsage': 'Uso de Artigos',
  'TenseConsistency': 'Tempo Verbal',
  'WordChoice': 'Escolha de Palavras',
  'SentenceStructure': 'Estrutura da Frase',
  'Grammar': 'Gramática Geral',
  'Coherence': 'Coerência',
};

const translateTerm = (term) => translationMap[term] || term;

export default function ImprovementAreasChart({ data }) {

  const translatedData = data.map(item => ({
    ...item,
    name: translateTerm(item.name)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        layout="vertical" 
        data={translatedData} 
        margin={{ top: 5, right: 30, left: 30, bottom: 5 }} 
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ fill: '#FFF', fontSize: 12 }} 
          width={180} 
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
            cursor={{ fill: '#ffffff1a' }}
            contentStyle={{
                backgroundColor: '#202831',
                borderColor: '#444',
                color: '#fff',
                borderRadius: '8px'
            }}
            formatter={(value) => `${value}% das respostas`} 
        />
        <Bar dataKey="percentage" fill="#3eb851" barSize={20}>
          <LabelList 
            dataKey="percentage" 
            position="right" 
            formatter={(value) => `${value}%`} 
            style={{ fill: '#FFF', fontSize: 12 }} 
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}