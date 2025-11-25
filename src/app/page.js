'use client';

import { ThemeProvider } from "@primer/react-brand";
import styles from "./page.module.css";
import {Hero, Section, SectionIntro, Heading, Text, Grid, Stack} from '@primer/react-brand';

export default function Home() {
  return (
    <ThemeProvider colorMode="dark">
      <div className={styles.page}>
        {/* Hero Section - Full Height */}
        <div className={styles.heroSection}>
          <Hero align="center">
            <Hero.Label color="blue">Inteligência Artificial</Hero.Label>
            <Hero.Heading size="2">Pratique seu inglês do jeitinho dev.</Hero.Heading>
            <Hero.Description>Ouça, leia, escreva e fale com um conjunto de lições para aprender.</Hero.Description>
            <Hero.PrimaryAction href="/login" variant="primary" className={styles.primary}>Comece agora gratuitamente</Hero.PrimaryAction>
            <Hero.Image
              position="inline-end"
              src="images/landing_banner.png"
              alt="placeholder, blank area with a gray background color"
              style={{height: '100%'}}
            />
          </Hero>
        </div>

        {/* Features Section */}
        <Section className={styles.section}>
          <SectionIntro align="center">
            <Heading as="h2" size="3">Aprenda inglês com contexto de programação</Heading>
            <Text size="300" variant="muted">
              Uma plataforma desenvolvida especialmente para quem programa e quer dominar o inglês técnico
            </Text>
          </SectionIntro>

          <Grid>
            <Grid.Column span={{medium: 12, large: 4}}>
              <div className={styles.featureColumn}>
                <Stack gap="spacious" padding="normal">
                  <div className={styles.featureIcon}>🎤</div>
                  <Heading as="h3" size="4">Reconhecimento de Voz</Heading>
                  <Text variant="muted">
                    Pratique sua pronúncia com reconhecimento de voz em tempo real.
                    Receba feedback instantâneo sobre sua fala.
                  </Text>
                </Stack>
              </div>
            </Grid.Column>

            <Grid.Column span={{medium: 12, large: 4}}>
              <div className={styles.featureColumn}>
                <Stack gap="spacious" padding="normal">
                  <div className={styles.featureIcon}>🤖</div>
                  <Heading as="h3" size="4">IA Personalizada</Heading>
                  <Text variant="muted">
                    Inteligência artificial avalia suas respostas considerando gramática,
                    coerência, contexto técnico e relevância.
                  </Text>
                </Stack>
              </div>
            </Grid.Column>

            <Grid.Column span={{medium: 12, large: 4}}>
              <div className={styles.featureColumn}>
                <Stack gap="spacious" padding="normal">
                  <div className={styles.featureIcon}>🎯</div>
                  <Heading as="h3" size="4">Exercícios Progressivos</Heading>
                  <Text variant="muted">
                    Trilha de aprendizado estruturada por níveis, do básico ao avançado,
                    com exercícios focados no universo dev.
                  </Text>
                </Stack>
              </div>
            </Grid.Column>
          </Grid>
        </Section>

        {/* Gamification Section */}
        <Section className={styles.section} backgroundColor="subtle">
          <SectionIntro align="center">
            <Heading as="h2" size="3">Sistema de conquistas e progresso</Heading>
            <Text size="300" variant="muted">
              Mantenha-se motivado com conquistas, XP e estatísticas detalhadas
            </Text>
          </SectionIntro>

          <Grid>
            <Grid.Column span={{medium: 12, large: 4}}>
              <div className={styles.featureColumn}>
                <Stack gap="spacious" padding="normal">
                  <div className={styles.featureIcon}>🏆</div>
                  <Heading as="h3" size="5">10+ Conquistas</Heading>
                  <Text variant="muted">
                    Desbloqueie conquistas como "Determinado", "Perfeccionista",
                    "Star Streak" e "Veterano" conforme avança.
                  </Text>
                </Stack>
              </div>
            </Grid.Column>

            <Grid.Column span={{medium: 12, large: 4}}>
              <div className={styles.featureColumn}>
                <Stack gap="spacious" padding="normal">
                  <div className={styles.featureIcon}>📊</div>
                  <Heading as="h3" size="5">Estatísticas Detalhadas</Heading>
                  <Text variant="muted">
                    Acompanhe seu progresso com gráficos de evolução, áreas de melhoria,
                    vocabulário e habilidades.
                  </Text>
                </Stack>
              </div>
            </Grid.Column>

            <Grid.Column span={{medium: 12, large: 4}}>
              <div className={styles.featureColumn}>
                <Stack gap="spacious" padding="normal">
                  <div className={styles.featureIcon}>⭐</div>
                  <Heading as="h3" size="5">Sistema de Estrelas</Heading>
                  <Text variant="muted">
                    Receba até 5 estrelas por resposta baseado em múltiplos critérios
                    de avaliação automática.
                  </Text>
                </Stack>
              </div>
            </Grid.Column>
          </Grid>
        </Section>

        {/* How It Works Section */}
        <Section className={styles.section}>
          <SectionIntro align="center">
            <Heading as="h2" size="3">Como funciona</Heading>
            <Text size="300" variant="muted">
              Simples, prático e eficiente
            </Text>
          </SectionIntro>

          <Stack>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <Stack gap="condensed">
                <Heading as="h3" size="5">Crie sua conta gratuitamente</Heading>
                <Text variant="muted">
                  Cadastre-se em segundos e comece sua jornada de aprendizado imediatamente.
                </Text>
              </Stack>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <Stack gap="condensed">
                <Heading as="h3" size="5">Escolha seu exercício</Heading>
                <Text variant="muted">
                  Navegue pela trilha de exercícios organizados por níveis e temas de programação.
                </Text>
              </Stack>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <Stack gap="condensed">
                <Heading as="h3" size="5">Pratique e receba feedback</Heading>
                <Text variant="muted">
                  Responda as perguntas por texto ou voz e receba avaliação instantânea da IA.
                </Text>
              </Stack>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>4</div>
              <Stack gap="condensed">
                <Heading as="h3" size="5">Acompanhe sua evolução</Heading>
                <Text variant="muted">
                  Ganhe XP, desbloqueie conquistas e visualize suas estatísticas de progresso.
                </Text>
              </Stack>
            </div>
          </Stack>
        </Section>

        {/* CTA Section */}
        <Section className={styles.ctaSection}>
          <Stack alignItems="center">
            <Heading as="h2" size="3" align="center">
              Pronto para melhorar seu inglês técnico?
            </Heading>
            <Text size="300" variant="muted" align="center">
              Junte-se a outros desenvolvedores que estão dominando o inglês da área de tecnologia
            </Text>
            <a href="/register" className={styles.ctaButton}>
              Começar agora gratuitamente
            </a>
          </Stack>
        </Section>
      </div>
    </ThemeProvider>
  );
}
