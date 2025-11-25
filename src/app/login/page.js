"use client";

import styles from "./page.module.css";
import { Button, FormControl, Heading, Text, TextInput } from "@primer/react";
import { Banner } from "@primer/react/experimental";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    login: "",
    password: "",
  });

  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);

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

    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) return (window.location.href = "/practice");

        setSending(false);
        return setError(true);
      })
      .catch(() => {
        setSending(false);
        return setError(true);
      });
  };

  return (
    <form className={styles.form} onSubmit={send}>
      {error && (
        <Banner
          title="Erro"
          hideTitle
          description={
            "Houve um erro ao fazer login. Verifique se você digitou as credenciais corretamente."
          }
          variant="critical"
        />
      )}
      <Heading>Login</Heading>
      <FormControl>
        <TextInput
          value={formValue("login")}
          onInput={(event) => changeForm(event.target.value, "login")}
          size="large"
          className={styles.wfull}
        />
        <FormControl.Label>E-mail ou nome de usuário</FormControl.Label>
      </FormControl>
      <FormControl>
        <TextInput
          value={formValue("password")}
          onChange={(event) => changeForm(event.target.value, "password")}
          size="large"
          type="password"
          className={styles.wfull}
        />
        <FormControl.Label>Senha</FormControl.Label>
      </FormControl>
      <Button
        variant="primary"
        type="submit"
        size="large"
        className={styles.wfull}
        loading={sending}
      >
        Login
      </Button>
      <div className={styles.inline}>
        <Text>Não possui uma conta?</Text>
        <Button
          variant="link"
          onClick={() => router.push("/register")}
          size="large"
        >
          Registre-se já
        </Button>
      </div>
    </form>
  );
}
