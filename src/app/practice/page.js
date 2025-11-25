'use client';

import { Heading, Label, Link, Text, Timeline } from "@primer/react";
import styles from './page.module.css';
import { IssueClosedIcon, IssueDraftIcon, StopIcon } from "@primer/octicons-react";
import { SkeletonText } from '@primer/react/experimental'
import React, { useEffect, useState } from "react";

export default function Practice() {
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    fetch('/api/trail')
      .then((response) => response.json())
      .then((data) => {
        setTrail(data);
      });
  }, [])

  return (
    <div className={styles.page}>
      {
        !trail.length ?
          <>
            <SkeletonText size="titleLarge" />
            <SkeletonText lines={5} />
            <SkeletonText size="titleLarge" />
            <SkeletonText lines={5} />
            <SkeletonText size="titleLarge" />
            <SkeletonText lines={5} />
          </>
        :
        trail.map((trail, index) => <React.Fragment key={index}>
          <Heading>{trail.name}</Heading>
          <Timeline className={styles.wfull}>
            {
              trail.exercises.map((exercise, index) => <React.Fragment key={index}>
                <Timeline.Item>
                  <Timeline.Badge>
                    {
                      !exercise.completed ?
                      <IssueDraftIcon size={16} /> :
                      <IssueClosedIcon className={styles.completed} size={16} />
                    }
                  </Timeline.Badge>
                  <Timeline.Body>
                    <Link href={'/exercises/' + exercise.id} className={styles.link}>{exercise.name}</Link>
                    {
                      !exercise.completed &&
                      <Label variant="success" className={styles.xp}>{exercise.xp} xp</Label>
                    }
                  </Timeline.Body>
                </Timeline.Item>
              </React.Fragment>)
            }
          </Timeline>
        </React.Fragment>)
      }
      <Heading>🚧 Em construção</Heading>
      <Timeline className={styles.wfull}>
        <Timeline.Item>
          <Timeline.Badge>
            <StopIcon className={styles.underConstruction} size={16} />
          </Timeline.Badge>
          <Timeline.Body>
            <Text>Obrigado por ser um apoiador inicial! Novos materiais estão em construção e serão disponibilizados em breve.</Text>
          </Timeline.Body>
        </Timeline.Item>
      </Timeline>
    </div>
  );
}
