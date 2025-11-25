'use client';

import { Avatar, BranchName, Button, Heading, Label, RelativeTime, Text } from '@primer/react';
import { UnderlinePanels } from '@primer/react/experimental'
import styles from './page.module.css';
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircleFillIcon, CodeReviewIcon, FileBadgeIcon, GraphIcon, HeartIcon, LockIcon, NorthStarIcon, PencilIcon, StarIcon, ThumbsupIcon, TrophyIcon } from '@primer/octicons-react';
import { BreakoutBanner, Label as BrandLabel } from '@primer/react-brand';
import { Blankslate } from '@primer/react/experimental'
import { FlameIcon, RocketIcon, SmileyIcon } from '@primer/octicons-react';
import { useAuth } from '@/components/hooks/auth-provider';
import { createAvatar } from '@dicebear/core';
import { identicon } from '@dicebear/collection';
import StatisticsTab from '@/components/StatisticsTab'; 

export default function Username() {
  const router = useRouter();
  const { username } = useParams();
  const { userData } = useAuth();
  const pathname = usePathname();

  const [user, setUser] = useState([]);

  const [generatingCertificate, setGeneratingCertificate] = useState(false);

  const icons = {
    'GraphIcon': GraphIcon,
    'FlameIcon': FlameIcon,
    'RocketIcon': RocketIcon,
    'TrophyIcon': TrophyIcon,
    'SmileyIcon': SmileyIcon,
    'NorthStarIcon': NorthStarIcon,
    'StarIcon': StarIcon,
    'ThumbsupIcon': ThumbsupIcon,
    'FileBadgeIcon': FileBadgeIcon,
    'HeartIcon': HeartIcon,
  }

  const getIcon = (icon, awarded) => {
    const Icon = icons[icon];
    if (awarded) {
      return <Icon size={24} fill={'var(--fgColor-done)'} />;
    } else {
      return <Icon size={24} fill={'var(--fgColor-muted)'} />;
    }
  }

  const generateCertificate = () => {
    setGeneratingCertificate(true);

    fetch('/api/user/certificate', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setGeneratingCertificate(false);
        if (data.success)
          setUser(prev => ({
            ...prev,
            features: [
              ...prev.features.filter(item => item !== 'redeem:certificate'),
              'certificate'
            ],
          }));

        window.location.href = window.location.href + '/certificate'; //TODO: temporário
      });
  }

  useEffect(() => {
    fetch('/api/users/' + username)
      .then((response) => response.json())
      .then((data) => {
        if (!data.username) {
          return window.location.href = '/404';
        }

        const avatar = createAvatar(identicon, {
          seed: data.username,
          backgroundColor: ['ffffff']
        });

        data.avatar = avatar.toDataUri();

        setUser(data);

        if (pathname.endsWith('/certificate'))
          setTimeout(() => {
            document.querySelector('span[data-content="Certificado"]').click();
          }, 100);
      });
  }, []);

  return (
    <div className={styles.page}>
      {
        user.username ?
          <>
            <div className={styles.profileInfo}>
              <Avatar square size={55} src={user.avatar} className={styles.avatar}></Avatar>
              <div className={styles.userData}>
                <Heading>{user.name} <BranchName>@{user.username}</BranchName></Heading>
                <div className={styles.dots}>
                  <Label variant="success" >{user.xp} xp</Label>
                  {
                    user.features.includes('admin') &&
                    <Label variant="attention" >Equipe englishfor.dev</Label>
                  }
                  <Text size='small' color={'var(--fgColor-muted)'}>Membro <RelativeTime date={new Date(new Date(user.created_at).getTime() - 3 * 60 * 60 * 1000)} prefix="desde" /></Text>
                </div>
              </div>
              {
                userData.username === username &&
                <Button className={styles.editProfile} trailingVisual={PencilIcon} onClick={() => router.push('/settings')}></Button>
              }
            </div>
            <UnderlinePanels>
              <UnderlinePanels.Tab icon={TrophyIcon}>Conquistas</UnderlinePanels.Tab>
              {
                // nova aba de Estatísticas
                userData.username === username &&
                <UnderlinePanels.Tab icon={GraphIcon}>Estatísticas</UnderlinePanels.Tab>
              }
              {
                (user.features.includes('certificate') || userData.username === username) &&
                <UnderlinePanels.Tab icon={FileBadgeIcon}>Certificado</UnderlinePanels.Tab>
              }

              {/* Painel de Conquistas */}
              <UnderlinePanels.Panel>
                {
                  user.achievements?.filter((achievement) => achievement.awarded).length > 0 &&
                  <Text className={styles.achievementTitle} color={'var(--fgColor-muted)'}>Desbloqueadas</Text>
                }
                {
                  user.achievements?.filter((achievement) => achievement.awarded).map((achievement) => (
                    <div key={achievement.id} className={styles.achievement}>
                      {getIcon(achievement.badge, true)}
                      <div>
                        <p>{achievement.name}</p>
                        <Text color={'var(--fgColor-muted)'}>{achievement.description}</Text>
                      </div>
                      <Text className={styles.achievementDate} size='small' color={'var(--fgColor-muted)'}>{new Date(new Date(achievement.awarded_at).getTime() - 3 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</Text>
                    </div>
                  ))
                }
                {
                  user.achievements?.filter((achievement) => !achievement.awarded).length > 0 &&
                  <Text className={styles.achievementTitle} color={'var(--fgColor-muted)'}>Bloqueadas</Text>
                }
                {
                  user.achievements?.filter((achievement) => !achievement.awarded).map((achievement) => (
                    <div key={achievement.id} className={styles.achievement}>
                      {getIcon(achievement.badge, false)}
                      <div>
                        <p>{achievement.name}</p>
                        <Text color={'var(--fgColor-muted)'}>{achievement.description}</Text>
                      </div>
                      <Text className={styles.achievementDate} size='small' color={'var(--fgColor-muted)'}>Bloqueada</Text>
                    </div>
                  ))
                }
              </UnderlinePanels.Panel>
              
              {
                // painel para renderizar o componente de Estatísticas
                userData.username === username &&
                <UnderlinePanels.Panel>
                  <StatisticsTab />
                </UnderlinePanels.Panel>
              }

              {/* Painéis de Certificado */}
              {
                (!user.features.includes('certificate') && userData.username === username) &&
                <UnderlinePanels.Panel>
                  {
                    !user.features.includes('redeem:certificate') ?
                      <Blankslate border>
                        <Blankslate.Visual>
                          <LockIcon size="medium" />
                        </Blankslate.Visual>
                        <Blankslate.Heading>Você ainda não possui o Certificado de Conclusão</Blankslate.Heading>
                        <Blankslate.Description>
                          Termine todos os exercícios do treinamento de inglês para desbloquear o seu certificado.
                        </Blankslate.Description>
                        <Blankslate.PrimaryAction href="/practice">Ir à trilha</Blankslate.PrimaryAction>
                      </Blankslate>
                      :
                      <Blankslate border>
                        <Blankslate.Visual>
                          <FileBadgeIcon size="medium" fill={'var(--fgColor-done)'} />
                        </Blankslate.Visual>
                        <Blankslate.Heading>Oba! Você pode resgatar o Certificado de Conclusão</Blankslate.Heading>
                        <Blankslate.Description>
                          Parabéns por finalizar todos os exercícios da plataforma, clique no botão abaixo para gerar seu certificado.
                          <Button variant='primary' className={styles.redeemCertificate} onClick={generateCertificate} inactive={generatingCertificate}>Gerar certificado</Button>
                        </Blankslate.Description>
                      </Blankslate>
                  }
                </UnderlinePanels.Panel>
              }
              {
                user.features.includes('certificate') &&
                <UnderlinePanels.Panel>
                  <BreakoutBanner
                    backgroundImageSrc={"/images/blurry-gradient.svg"}
                    align="center"
                  >
                    <h3><CodeReviewIcon size={24} className={styles.icon} /> englishfor.dev</h3>
                    <BreakoutBanner.Heading className={styles.certificateTitle}>
                      Certificado de Conclusão
                    </BreakoutBanner.Heading>
                    <BreakoutBanner.Description className={styles.certificateDescription}>
                      {user.name} concluiu com sucesso todos os exercícios do treinamento de inglês.
                    </BreakoutBanner.Description>
                    <BrandLabel className={styles.certificateLabel} color="green" leadingVisual={<CheckCircleFillIcon />}>Verificado</BrandLabel>
                  </BreakoutBanner>
                </UnderlinePanels.Panel>
              }
            </UnderlinePanels>
          </>
          :
          <></>
      }
    </div>
  )
}