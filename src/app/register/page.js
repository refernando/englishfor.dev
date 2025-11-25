"use client";

import styles from "./page.module.css";
import { Button, FormControl, Heading, Text, TextInput } from "@primer/react";
import { Banner } from "@primer/react/experimental";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });

  const [registerError, setRegisterError] = useState(false);
  const [inputErrors, setInputErrors] = useState({});
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

    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          setSending(false);
          return setInputErrors({
            [data.type]: data.message,
          });
        }

        return (window.location.href = "/practice");
      })
      .catch(() => {
        setSending(false);
        return setRegisterError(true);
      });
  };

  return (
    <form className={styles.form} onSubmit={send}>
      {registerError && (
        <Banner
          title="Erro"
          hideTitle
          description={
            "Houve um erro ao cadastrar. Verifique se você digitou os dados corretamente"
          }
          variant="critical"
        />
      )}
      <Heading>Cadastro</Heading>
      <FormControl>
        <TextInput
          value={formValue("username")}
          onInput={(event) => changeForm(event.target.value, "username")}
          size="large"
          className={styles.wfull}
        />
        <FormControl.Label>Usuário</FormControl.Label>
        {inputErrors["username"] && (
          <FormControl.Validation variant="error">
            {inputErrors["username"]}
          </FormControl.Validation>
        )}
      </FormControl>
      <FormControl>
        <TextInput
          value={formValue("name")}
          onInput={(event) => changeForm(event.target.value, "name")}
          size="large"
          className={styles.wfull}
        />
        <FormControl.Label>Nome</FormControl.Label>
        {inputErrors["name"] && (
          <FormControl.Validation variant="error">
            {inputErrors["name"]}
          </FormControl.Validation>
        )}
      </FormControl>
      <FormControl>
        <TextInput
          value={formValue("email")}
          onInput={(event) => changeForm(event.target.value, "email")}
          size="large"
          className={styles.wfull}
        />
        <FormControl.Label>Email</FormControl.Label>
        {inputErrors["email"] && (
          <FormControl.Validation variant="error">
            {inputErrors["email"]}
          </FormControl.Validation>
        )}
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
        {inputErrors["password"] && (
          <FormControl.Validation variant="error">
            {inputErrors["password"]}
          </FormControl.Validation>
        )}
      </FormControl>
      <Button
        variant="primary"
        type="submit"
        size="large"
        className={styles.wfull}
        loading={sending}
      >
        Cadastrar
      </Button>
      <div className={styles.inline}>
        <Text>Possui uma conta?</Text>
        <Button
          variant="link"
          onClick={() => router.push("/login")}
          size="large"
        >
          Entre já
        </Button>
      </div>
    </form>
  );
}
