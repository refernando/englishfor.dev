'use client';

import { ArrowRightIcon, CheckCircleIcon, EllipsisIcon, EyeClosedIcon, EyeIcon, MuteIcon, PaperAirplaneIcon, SquareCircleIcon, StarFillIcon, StarIcon, UnmuteIcon } from '@primer/octicons-react';
import styles from './page.module.css';
import { Button, FormControl, Heading, IconButton, Label, ProgressBar, Text, Textarea } from "@primer/react";
import { SkeletonText, Banner, Blankslate } from '@primer/react/experimental'
import Confetti from 'react-confetti';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { useAudio } from '@/components/hooks/audio';
import { useAuth } from '@/components/hooks/auth-provider';

export default function Exercise() {
  const { id } = useParams();
  const router = useRouter();
  const { playSound } = useAudio();
  const { userData, setUserData } = useAuth();

  const [exercise, setExercise] = useState([]);
  const [review, setReview] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentVoiceIndex, setCurrentVoiceIndex] = useState(-1);

  const [showQuestion, setShowQuestion] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [tryAgain, setTryAgain] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isEligibleForXP, setIsEligibleForXP] = useState(true);

  const [answer, setAnswer] = useState("");
  const [answerConfidence, setAnswerConfidence] = useState(null);
  const [voiceRecognition, setVoiceRecognition] = useState(null);
  const [voiceRecognitionError, setVoiceRecognitionError] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const speak = (text) => {
    if (!audioEnabled) return;

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const englishVoices = synth.getVoices().filter(voice => voice.lang === 'en-US');
    utterance.lang = "en-US";

    // if (currentVoiceIndex === -1) {
    //   const randomVoiceIndex = Math.floor(Math.random() * englishVoices.length);
    //   utterance.voice = englishVoices[randomVoiceIndex];
    //   setCurrentVoiceIndex(randomVoiceIndex);
    // } else if (currentVoiceIndex < englishVoices.length - 1) {
    //   utterance.voice = englishVoices[currentVoiceIndex + 1];
    //   setCurrentVoiceIndex(currentVoiceIndex + 1);
    // } else {
    //   utterance.voice = englishVoices[0];
    //   setCurrentVoiceIndex(0);
    // }

    utterance.voice = englishVoices.filter(voice => voice.name.includes("Google US English"))[0];

    synth.speak(utterance);
  }

  const stopSpeaking = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
  }

  const muteAudio = () => {
    if (audioEnabled) {
      stopSpeaking();
      localStorage.setItem('audioMuted', 'true');
    } else {
      localStorage.removeItem('audioMuted');
    }

    setAudioEnabled(!audioEnabled);
  }

  const hideQuestion = () => {
    if (showQuestion) {
      localStorage.setItem('questionHidden', 'true');
    } else {
      localStorage.removeItem('questionHidden');
    }

    setShowQuestion(!showQuestion);
  }

  const record = () => {
    if (!voiceRecognition) {
      setVoiceRecognitionError("Seu navegador não é compatível com o serviço de reconhecimento de fala, tente novamente em um outro navegador.");
      return;
    }

    if (!isRecording) {
      voiceRecognition.start();
      setIsRecording(true);
    } else {
      voiceRecognition.stop();
      setIsRecording(true);
    }
  }

  const startExercise = () => {
    window.onbeforeunload = () => {
      if (window.location.pathname.startsWith("/exercises/"))
        return "Tem certeza que deseja sair do exercício?";
    }

    setIsStarted(true);
    speak(selectedQuestion.text);
    if (localStorage.getItem('alwaysUseMicrophone')) record();
  }

  const endExercise = () => {
    fetch('/api/user/progressions', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exercise_id: exercise.id,
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success && data.type === "progression") {
          setIsEligibleForXP(false);
        } else {
          setUserData({
            ...userData,
            xp: userData.xp + exercise.xp,
          });
        }
        setIsFinished(true);
        setIsReviewing(false);
        if (audioEnabled) playSound('completed');
        window.onbeforeunload = () => {};
      });
  }

  const nextQuestion = () => {
    const currentIndex = exercise.questions.indexOf(selectedQuestion);

    setProgress(((currentIndex + 1) / exercise.questions.length) * 100);

    if (currentIndex === exercise.questions.length - 1) {
      endExercise();
      return;
    }

    const next = exercise.questions[currentIndex + 1];

    setAnswer("");
    setAnswerConfidence(null);
    setVoiceRecognitionError(null);
    setIsRecording(false);
    setReview(null);
    setTryAgain(false);
    setIsReviewing(false);
    setSelectedQuestion(next);
    speak(next.text);

    if (localStorage.getItem('alwaysUseMicrophone')) record();
  }

  const repeatQuestion = () => {
    setAnswer("");
    setAnswerConfidence(null);
    setVoiceRecognitionError(null);
    setIsRecording(false);
    setTryAgain(false);
    setReview(null);
    setIsReviewing(false);
  }

  const validateExercise = () => {
    setIsLoading(true);

    fetch('/api/answer/', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: selectedQuestion.text,
        answer,
        usedVoice: answerConfidence !== null ? true : false,
        questionId: selectedQuestion.id
      })
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        setReview(data.response);

        if (
          data.response.grammar <= 2 ||
          data.response.coherence <= 2 ||
          data.response.relevance <= 2
        ) {
          if (audioEnabled) playSound('one_beep');
          setTryAgain(true);
          setIsReviewing(true);
          return;
        }

        if (audioEnabled) playSound('success');
        setIsReviewing(true);
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
        setVoiceRecognitionError("Houve um erro ao processar sua resposta, tente novamente.");
      });
  }

  useEffect(() => {
    fetch('/api/exercises/' + id)
    .then((response) => response.json())
    .then((data) => {
      setExercise(data);

      setSelectedQuestion(data.questions[0]);
      //TODO: pensar se vamos fazer random question ou manter a ordem específica
    });

    window.speechSynthesis?.getVoices();
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (localStorage.getItem('audioMuted')) setAudioEnabled(false);
    if (localStorage.getItem('questionHidden')) setShowQuestion(false);

    if (window.SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onaudiostart = () => {
        setIsRecording(true);
      }

      recognition.onerror = (event) => {
        switch(event.error) {
          case "no-speech":
            setVoiceRecognitionError("Nenhuma fala foi detectada, tente novamente.");
            break;
          case "aborted":
            setVoiceRecognitionError("A captura de voz foi abortada.");
            break;
          case "audio-capture":
            setVoiceRecognitionError("Houve um problema ao capturar o áudio, tente novamente.");
            break;
          case "network":
            setVoiceRecognitionError("Não foi possível se conectar com o servidor de reconhecimento de fala. Isso pode indicar que seu navegador não é compatível com esta funcionalidade, tente novamente em um outro navegador.");
            break;
          case "not-allowed":
            setVoiceRecognitionError("A permissão de utilizar microfone foi negada no navegador, habilite e tente novamente.");
            break;
          case "service-not-allowed":
            setVoiceRecognitionError("O serviço de reconhecimento de fala foi negado. Isso pode indicar que seu navegador não é compatível com esta funcionalidade, tente novamente em um outro navegador.");
            break;
          default:
            setVoiceRecognitionError("Houve um problema ao iniciar o serviço de reconhecimento de fala. Isso pode indicar que seu navegador não é compatível com esta funcionalidade, tente novamente em um outro navegador.");
            break;
        }

        setIsRecording(false);
      };

      recognition.onend = () => {
        console.log('Speech recognition stopped.');
        setIsRecording(false);
      };

      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1][0];

        setAnswerConfidence(result.confidence * 100);
        setAnswer((answer) => answer + result.transcript);
      };

      setVoiceRecognition(recognition);
    }
  }, []);

  return (
    <div className={styles.page}>
      {
        !isStarted &&
        <div className={`${styles.exercise} ${styles.w1000}`}>
          <Text size='small' color={'var(--fgColor-muted)'}>Exercício</Text>
          {
            exercise.name ?
            <>
              <Heading className={styles.title}>{exercise.name} <Label variant="success" size='large' className={styles.xp}>{exercise.xp} xp</Label></Heading>
              <Text>{exercise.description}</Text>
              <div className={styles.buttons}>
                <Button size="large" variant="primary" onClick={startExercise} trailingVisual={ArrowRightIcon}>Começar exercício</Button>
              </div>
            </>
            :
            <>
              <SkeletonText size="titleLarge" />
              <SkeletonText lines={3} />
            </>
          }
        </div>
      }
      {
        (isStarted && !isFinished && !isReviewing) &&
        <>
          <div className={styles.question}>
            <IconButton variant="primary" size="large" onClick={() => speak(selectedQuestion.text)} disabled={!audioEnabled} icon={UnmuteIcon} aria-label="Ouvir pergunta"></IconButton>
            <h1 className={!showQuestion ? styles.hideQuestion : null} onClick={!showQuestion ? () => setShowQuestion(!showQuestion) : null}>{selectedQuestion.text}</h1>
          </div>
          <div className={`${styles.controls} ${styles.w1000}`}>
            <FormControl>
              <FormControl.Label>Sua resposta</FormControl.Label>
              <Textarea
                className={styles.textarea}
                resize='vertical'
                onChange={(event) => setAnswer(event.target.value)}
                value={answer}
              />
              {
                answerConfidence !== null &&
                <>
                  {/* <FormControl.Validation variant={answerConfidence > 85  ? "success" : "error"}>Confiança da última frase detectada: {answerConfidence.toFixed(1)}%</FormControl.Validation> */}
                  <FormControl.Validation>Confiança da última frase detectada por voz: {answerConfidence.toFixed(1)}%</FormControl.Validation>
                  <FormControl.Caption>A porcentagem nem sempre está correta</FormControl.Caption>
                </>
              }
            </FormControl>
            <div className={styles.buttons}>
              <IconButton onClick={muteAudio} icon={!audioEnabled ? MuteIcon : UnmuteIcon} aria-label={!audioEnabled ? "Ativar áudio" : "Desativar áudio"}></IconButton>
              <IconButton onClick={hideQuestion} icon={!showQuestion ? EyeClosedIcon : EyeIcon} aria-label={!showQuestion ? "Mostrar pergunta" : "Ocultar pergunta"}></IconButton>
              <Button variant={!isRecording ? "default" : "danger"} onClick={record} trailingVisual={!isRecording ? EllipsisIcon : SquareCircleIcon}>{!isRecording ? "Responder por voz" : "Ouvindo"}</Button>
              <Button variant="primary" onClick={validateExercise} disabled={isRecording || !answer.length} trailingVisual={PaperAirplaneIcon} loading={isLoading}>Pronto</Button>
            </div>
            {
              voiceRecognitionError &&
              <Banner
                title="Erro"
                hideTitle
                description={voiceRecognitionError}
                variant="warning"
                className={styles.errorBanner}
                onDismiss={() => {
                  setVoiceRecognitionError("")
                }}
              />
            }
          </div>
        </>
      }
      {
        (isReviewing && !isFinished) &&
        <div className={`${styles.exercise} ${styles.w1000}`}>
          <ul className={styles.list}>
            <li>
              <Text size='small' color={'var(--fgColor-muted)'}>Revisão <Label variant="accent">IA</Label></Text>
              <p>{review.feedback}</p>
            </li>
            <li>
              <Text size='small' color={'var(--fgColor-muted)'}>Coerência: sentido no contexto geral</Text>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) =>
                  i < review.coherence ? <StarFillIcon fill="gold" key={i} /> : <StarIcon key={i} fill="var(--fgColor-muted)" />
                )}
              </div>
            </li>
            <li>
              <Text size='small' color={'var(--fgColor-muted)'}>Gramática: correção gramatical</Text>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) =>
                  i < review.grammar ? <StarFillIcon fill="gold" key={i} /> : <StarIcon key={i} fill="var(--fgColor-muted)" />
                )}
              </div>
            </li>
            <li>
              <Text size='small' color={'var(--fgColor-muted)'}>Relevância: responde a pergunta corretamente</Text>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) =>
                  i < review.relevance ? <StarFillIcon fill="gold" key={i} /> : <StarIcon key={i} fill="var(--fgColor-muted)" />
                )}
              </div>
            </li>
            <li>
              <Text size='small' color={'var(--fgColor-muted)'}>Contexto: sentido no contexto de tecnologia</Text>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) =>
                  i < review.techContext ? <StarFillIcon fill="gold" key={i} /> : <StarIcon key={i} fill="var(--fgColor-muted)" />
                )}
              </div>
            </li>
            <li>
              <Text size='small' color={'var(--fgColor-muted)'}>Pergunta</Text>
              <p>{selectedQuestion.text}</p>
            </li>
            <li>
              <Text size='small' color={'var(--fgColor-muted)'}>Sua resposta {answerConfidence && <Label variant="secondary">Utiliza voz</Label>}</Text>
              <p>{answer}</p>
            </li>
            {
              review.improvedSentence &&
              <li>
                <Text size='small' color={'var(--fgColor-muted)'}>Resposta melhorada <Label variant="accent">IA</Label></Text>
                <p>{review.improvedSentence}</p>
              </li>
            }
          </ul>
          <div className={styles.buttons}>
            {
              tryAgain &&
              <Text color={'var(--fgColor-muted)'}>Que tal conseguir uma nota melhor?</Text>
            }
            <Button size="large" variant="primary" onClick={!tryAgain ? nextQuestion : repeatQuestion} trailingVisual={ArrowRightIcon}>{!tryAgain ? "Continuar" : "Tentar novamente"}</Button>
          </div>
        </div>
      }
      {
        isFinished && <div className={styles.finished}>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={800}
            tweenDuration={5000}
            gravity={0.15}
          />
          <Blankslate className={styles.blankslate} border>
            <Blankslate.Visual>
              <CheckCircleIcon size="medium" fill={'var(--fgColor-success)'} />
            </Blankslate.Visual>
            <Blankslate.Heading>Exercício concluído</Blankslate.Heading>
            <Blankslate.Description>
              {
                isEligibleForXP ?
                <>
                  <Label variant="success" size='large' className={styles.xp}>{exercise.xp} xp</Label> obtidos!
                </>
                :
                <>Parece que você completou o nível novamente, que legal!</>
              }
            </Blankslate.Description>
            <Blankslate.PrimaryAction href="/practice">Voltar à trilha</Blankslate.PrimaryAction>
          </Blankslate>
          {/* <Button variant="link" onClick={() => router.push('/practice')} size="large">
            Ver mais exercícios
          </Button> */}
        </div>
      }
      <ProgressBar className={`progress ${styles.w1000}`} bg="success.emphasis" progress={progress} />
    </div>
  );
}
