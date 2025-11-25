'use client'

import { CodeReviewIcon, SignOutIcon, SignInIcon, CommentDiscussionIcon, FeedStarIcon, ThreeBarsIcon, PersonIcon, SearchIcon, XCircleFillIcon, GearIcon } from '@primer/octicons-react'
import styles from './navbar.module.css'
import {ActionList, ActionMenu, AnchoredOverlay, Avatar, Button, Header, TextInput} from '@primer/react'
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/auth-provider';
import { useEffect, useRef, useState } from 'react';
import { createAvatar } from '@dicebear/core';
import { identicon } from '@dicebear/collection';

export default function NavBar() {
  const router = useRouter();
  const { isLogged, userData, setUserData } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const searchTimeout = useRef(null);

  const onSearchInput = (value) => {
    setSearchInput(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      search(value);
    }, 500);
  }

  const search = (query) => {
    if (!query) return;

    fetch("/api/users/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({search: query}),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          data.forEach((user) => {
            const avatar = createAvatar(identicon, {
              seed: user.username,
              backgroundColor: ['ffffff']
            });

            user.avatar = avatar.toDataUri();
          });
          setSearchUsers(data);
        } else {
          setSearchUsers([{error: "Nenhum usuário encontrado."}])
        }
        setSearchOpen(true);
      })
      .catch((error) => {
      });
  }

  const onUserSelect = (username) => {
    setSearchOpen(false);
    router.push('/@' + username);
  }

  const logout = () => {
    fetch("/api/logout")
      .then((response) => response.text())
      .then((data) => {
        return window.location.href = '/';
      });
  }

  useEffect(() => {
    if (localStorage.getItem('highContrast')) document.documentElement.classList.add('high-contrast');
    if (localStorage.getItem('largerFont')) document.documentElement.classList.add('larger-font');

    fetch("/api/user")
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
      });
  }, [])

  return (
    <Header className={styles.navbar}>
      <Header.Item className={styles.headerItem} suppressHydrationWarning>
        <Header.Link
          href="/"
          sx={{
            fontSize: 2,
          }}
        >
          <CodeReviewIcon size={24} className={styles.icon} />
          <span className={styles.brand}>englishfor.dev</span>
        </Header.Link>
      </Header.Item>
      <Header.Item className={styles.headerItem} suppressHydrationWarning full></Header.Item>
      {
        !isLogged ?
        <>
          <Header.Item className={styles.headerItem} suppressHydrationWarning>
            <Button variant="link" onClick={() => router.push('/register')} size="large">Cadastrar</Button>
          </Header.Item>
          <Header.Item sx={{mr: 0 }}>
            <Button leadingVisual={SignInIcon} variant="primary" onClick={() => router.push('/login')} size="large">Entrar</Button>
          </Header.Item>
        </> :
        <>
          <Header.Item className={styles.headerItem} suppressHydrationWarning>
            {
              !isNaN(userData.xp) &&
              <span className={styles.xp}>
                <FeedStarIcon size={16} fill={'var(--fgColor-success)'} /><span id='xp'>{userData.xp}</span> XP
              </span>
            }
          </Header.Item>
          <Header.Item className={styles.headerItem} suppressHydrationWarning>
            <AnchoredOverlay
              focusTrapSettings={{
                disabled: true
              }}
              focusZoneSettings={{
                disabled: true
              }}
              open={searchOpen && searchUsers.length}
              onOpen={() => setSearchOpen(true)}
              onClose={() => setSearchOpen(false)}
              renderAnchor={props =>
                <TextInput
                  trailingAction={
                    searchInput ?
                    <TextInput.Action
                      onClick={() => {
                        setSearchInput("");
                        setSearchUsers([]);
                        setSearchOpen(false);
                      }}
                      icon={XCircleFillIcon}
                      aria-label="Limpar pesquisa"
                    /> : null
                  }
                  leadingVisual={SearchIcon}
                  placeholder='Pesquisar'
                  autoComplete='off'
                  onInput={(event) => onSearchInput(event.target.value)}
                  value={searchInput}
                  {...props}
                />
              }
              side="outside-bottom"
              align="flex-start"
              width="medium"
              anchorOffset={3}
              alignmentOffset={-45}
            >
              {
                searchUsers[0] && searchUsers[0].error ?
                <div className={styles.searchError}>{searchUsers[0].error}</div> :
                <ActionList>
                  {
                    searchUsers.map((user, index) =>
                      <ActionList.Item onSelect={() => onUserSelect(user.username)} key={index}>
                        <ActionList.LeadingVisual>
                          <Avatar square src={user.avatar}></Avatar>
                        </ActionList.LeadingVisual>
                        {user.name}
                        <ActionList.Description>@{user.username}</ActionList.Description>
                      </ActionList.Item>
                    )
                  }
                </ActionList>
              }
            </AnchoredOverlay>
          </Header.Item>
          <Header.Item
            sx={{
              mr: 0,
            }}
          >
            <ActionMenu>
              <ActionMenu.Button trailingVisual={ThreeBarsIcon} trailingAction={null}>
              </ActionMenu.Button>
              <ActionMenu.Overlay width='small'>
                <ActionList>
                  <ActionList.Item onSelect={() => router.push('/practice')}>
                    <CommentDiscussionIcon /> Praticar
                  </ActionList.Item>
                  <ActionList.Item onSelect={() => router.push('/@' + userData.username)}>
                    <PersonIcon /> Meu perfil
                  </ActionList.Item>
                  <ActionList.Item onSelect={() => router.push('/settings')}>
                    <GearIcon /> Configurações
                  </ActionList.Item>
                  <ActionList.Divider />
                  <ActionList.Item variant='danger' onSelect={logout}>
                    <SignOutIcon /> Sair
                  </ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </Header.Item>
        </>
      }
    </Header>
  )
}
