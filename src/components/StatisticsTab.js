"use client";

import { useState, useEffect } from "react";
import { Tooltip } from "@primer/react";
import { InfoIcon } from "@primer/octicons-react";

import SkillsRadarChart from "./charts/SkillsRadarChart";
import ImprovementAreasChart from "./charts/ImprovementAreasChart";
import ProgressLineChart from "./charts/ProgressLineChart";
import VocabularyPieChart from "./charts/VocabularyPieChart";
import styles from "./StatisticsTab.module.css";

export default function StatisticsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch("/api/user/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <p className={styles.message}>Carregando estatísticas...</p>;
  }

  if (error) {
    return <p className={styles.message}>Erro ao carregar os dados. Tente novamente mais tarde.</p>;
  }

  if (!stats?.skillAverages || stats.skillAverages.length === 0) {
    return <p className={styles.message}>Ainda não há dados suficientes. Complete alguns exercícios para ver suas estatísticas!</p>;
  }

  return (
    <div className={styles.container}>
      {/* --- GRÁFICO 1 --- */}
      <div className={styles.chartBox}>
        <div className={styles.chartHeader}>
          <h3>Média de Competências</h3>
          <Tooltip text="Este gráfico mostra sua nota média (de 0 a 5) em quatro áreas-chave. Quanto maior a área, melhor sua performance. O ideal é que a forma seja grande e equilibrada." sx={{ zIndex: 1 }}>
            <button className={styles.infoButton}>
              <InfoIcon className={styles.infoIcon} />
            </button>
          </Tooltip>
        </div>
        <SkillsRadarChart data={stats.skillAverages} />
      </div>

      {/* --- GRÁFICO 2 --- */}
      <div className={styles.chartBox}>
        <div className={styles.chartHeader}>
          <h3>Frequência de Pontos a Melhorar</h3>
          <Tooltip text="Exibe os tipos de erros que você comete com mais frequência. A porcentagem indica a proporção de suas respostas que continham aquele erro. Use para focar seus estudos." sx={{ zIndex: 1 }}>
            <button className={styles.infoButton}>
              <InfoIcon className={styles.infoIcon} />
            </button>
          </Tooltip>
        </div>
        <ImprovementAreasChart data={stats.improvementPercentages} />
      </div>

      {/* --- GRÁFICO 3 --- */}
      <div className={styles.chartBox}>
        <div className={styles.chartHeader}>
          <h3>Evolução ao Longo do Tempo</h3>
          <Tooltip text="Mostra a evolução da sua nota média para cada resposta que você deu. Uma linha com tendência de subida indica que sua performance geral está melhorando." sx={{ zIndex: 1 }}>
            <button className={styles.infoButton}>
              <InfoIcon className={styles.infoIcon} />
            </button>
          </Tooltip>
        </div>
        <ProgressLineChart data={stats.progressOverTime} />
      </div>

      {/* --- GRÁFICO 4 --- */}
      <div className={styles.chartBox}>
        <div className={styles.chartHeader}>
          <h3>Uso de Vocabulário</h3>
          <Tooltip text="Classifica a complexidade do vocabulário em suas respostas. O objetivo é aumentar a fatia de vocabulário 'Intermediate' e 'Advanced' com o tempo." sx={{ zIndex: 1 }}>
            <button className={styles.infoButton}>
              <InfoIcon className={styles.infoIcon} />
            </button>
          </Tooltip>
        </div>
        <VocabularyPieChart data={stats.vocabularyDistribution} />
      </div>
    </div>
  );
}