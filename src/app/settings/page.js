'use client';

import { useAuth } from '@/components/hooks/auth-provider';
import styles from './page.module.css';
import { Button, Checkbox, FormControl, Heading, Label, Text, TextInput } from "@primer/react";
import { Banner, SkeletonText } from '@primer/react/experimental'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export default function Register() {
  const router = useRouter();
  var { userData, setUserData } = useAuth();

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });

  const [highContrast, setHighContrast] = useState(false);
  const [largerFont, setLargerFont] = useState(false);
  const [hideQuestion, setHideQuestion] = useState(false);
  const [muteAudio, setMuteAudio] = useState(false);
  const [alwaysUseMicrophone, setAlwaysUseMicrophone] = useState(false);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [inputErrors, setInputErrors] = useState({})

  const formValue = (ref) => {
    return form?.[ref] ? form?.[ref] : "";
  };

  const changeForm = (value, ref) => {
    setForm({ ...form, [ref]: value });
  };

  const send = (event) => {
    event.preventDefault();
    if (sending) return;

    setSending(true);

    fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          setSaveError(false);
          setSaveSuccess(false);
          return setInputErrors({
            [data.type]: data.message
          })
        }

        setInputErrors({});
        setSaveError(false);
        setSaveSuccess(true);
        setSending(false);

        fetch("/api/user")
          .then((response) => response.json())
          .then((data) => {
            setUserData(data);
          });

        // return window.location.href = '/practice';
      })
      .catch(() => {
        setSending(false);
        return setSaveError(true);
      });
  };

  const highContrastHandle = (event) => {
    if (event.target.checked) {
      localStorage.setItem('highContrast', 'true');
      document.documentElement.classList.add('high-contrast');
      setHighContrast(true);
    } else {
      localStorage.removeItem('highContrast');
      document.documentElement.classList.remove('high-contrast');
      setHighContrast(false);
    }
  }

  const largerFontHandle = (event) => {
    if (event.target.checked) {
      localStorage.setItem('largerFont', 'true');
      document.documentElement.classList.add('larger-font');
      setLargerFont(true);
    } else {
      localStorage.removeItem('largerFont');
      document.documentElement.classList.remove('larger-font');
      setLargerFont(false);
    }
  }

  const hideQuestionHandle = (event) => {
    if (event.target.checked) {
      localStorage.setItem('questionHidden', 'true');
      setHideQuestion(true);
    } else {
      localStorage.removeItem('questionHidden');
      setHideQuestion(false);
    }
  }

  const muteAudioHandle = (event) => {
    if (event.target.checked) {
      localStorage.setItem('audioMuted', 'true');
      setMuteAudio(true);
    } else {
      localStorage.removeItem('audioMuted');
      setMuteAudio(false);
    }
  }

  const alwaysUseMicrophoneHandle = (event) => {
    if (event.target.checked) {
      localStorage.setItem('alwaysUseMicrophone', 'true');
      setAlwaysUseMicrophone(true);
    } else {
      localStorage.removeItem('alwaysUseMicrophone');
      setAlwaysUseMicrophone(false);
    }
  }

  useEffect(() => {
    if (userData) {
      setForm({
        username: userData.username,
        name: userData.name,
        email: userData.email,
        password: "",
      });

      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (localStorage.getItem('highContrast')) setHighContrast(true);
    if (localStorage.getItem('largerFont')) setLargerFont(true);
    if (localStorage.getItem('questionHidden')) setHideQuestion(true);
    if (localStorage.getItem('audioMuted')) setMuteAudio(true);
    if (localStorage.getItem('alwaysUseMicrophone')) setAlwaysUseMicrophone(true);
  }, []);

  return (
    <div className={styles.page}>
      <Heading>Configurações</Heading>
      <form className={styles.box} onSubmit={send}>
        <h2>Perfil do usuário</h2>
        {
          loading ?
          <SkeletonText lines={4} size="titleLarge" />
          :
          <>
            {
              saveError &&
              <Banner
                title="Erro"
                hideTitle
                description={'Houve um erro ao salvar. Verifique se você digitou os dados corretamente'}
                variant="critical"
              />
            }
            {
              saveSuccess &&
              <Banner
                title="Sucesso"
                hideTitle
                description={'Dados salvos com sucesso'}
                variant="success"
              />
            }
            <FormControl>
              <TextInput
                value={formValue("username")}
                onInput={(event) => changeForm(event.target.value, "username")}
                size="large"
                className={styles.wfull}
              />
              <FormControl.Label>Usuário</FormControl.Label>
              {
                inputErrors['username'] &&
                <FormControl.Validation variant="error">{inputErrors['username']}</FormControl.Validation>
              }
            </FormControl>
            <FormControl>
              <TextInput
                value={formValue("name")}
                onInput={(event) => changeForm(event.target.value, "name")}
                size="large"
                className={styles.wfull}
              />
              <FormControl.Label>Nome</FormControl.Label>
              {
                inputErrors['name'] &&
                <FormControl.Validation variant="error">{inputErrors['name']}</FormControl.Validation>
              }
            </FormControl>
            <FormControl>
              <TextInput
                value={formValue("email")}
                onInput={(event) => changeForm(event.target.value, "email")}
                size="large"
                className={styles.wfull}
              />
              <FormControl.Label>Email</FormControl.Label>
              {
                inputErrors['email'] &&
                <FormControl.Validation variant="error">{inputErrors['email']}</FormControl.Validation>
              }
            </FormControl>
            <FormControl>
              <TextInput
                value={formValue("password")}
                onChange={(event) => changeForm(event.target.value, "password")}
                size="large"
                type="password"
                className={styles.wfull}
              />
              <FormControl.Label>Nova senha</FormControl.Label>
              {
                inputErrors['password'] &&
                <FormControl.Validation variant="error">{inputErrors['password']}</FormControl.Validation>
              }
            </FormControl>
            <Button variant="primary" type="submit" size="large" className={styles.wfull} loading={sending}>
              Salvar
            </Button>
          </>
        }
      </form>
      <div className={styles.box}>
        <h2>Preferências e acessibilidade</h2>
        {
          loading ?
          <SkeletonText lines={5} size="titleLarge" />
          :
          <>
            <FormControl>
              <Checkbox onChange={hideQuestionHandle} checked={hideQuestion} />
              <FormControl.Label>Ocultar perguntas</FormControl.Label>
              <FormControl.Caption>Desabilita a visualização de perguntas nos exercícios</FormControl.Caption>
            </FormControl>
            <FormControl>
              <Checkbox onChange={muteAudioHandle} checked={muteAudio} />
              <FormControl.Label>Desativar áudio</FormControl.Label>
              <FormControl.Caption>Desabilita a reprodução de áudio nos exercícios</FormControl.Caption>
            </FormControl>
            <FormControl>
              <Checkbox onChange={alwaysUseMicrophoneHandle} checked={alwaysUseMicrophone} />
              <FormControl.Label>Sempre usar microfone</FormControl.Label>
              <FormControl.Caption>Habilita a captura de voz automaticamente para cada pergunta</FormControl.Caption>
            </FormControl>
            <FormControl>
              <Checkbox onChange={highContrastHandle} checked={highContrast} />
              <FormControl.Label>Usar modo de alto contraste <Label variant="attention">Experimental</Label></FormControl.Label>
              <FormControl.Caption>Para pessoas com baixa visão, daltonismo, sensibilidade à luz ou dislexia</FormControl.Caption>
            </FormControl>
            <FormControl>
              <Checkbox onChange={largerFontHandle} checked={largerFont} />
              <FormControl.Label>Aumentar tamanho da fonte <Label variant="attention">Experimental</Label></FormControl.Label>
              <FormControl.Caption>Facilita a leitura com textos maiores</FormControl.Caption>
            </FormControl>
          </>
        }
      </div>
    </div>
  );
}
