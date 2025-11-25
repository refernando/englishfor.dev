import "./globals.css";
import { BaseStyles, ThemeProvider } from "@primer/react";
import { StyledComponentsRegistry } from "../components/registry";
import NavBar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { AuthProvider } from "@/components/hooks/auth-provider";
import { cookies } from "next/headers";
import authentication from "@/models/authentication";



export const metadata = {
  title: "englishfor.dev - Pratique seu inglês do jeitinho dev",
  description: "Ouça, leia, escreva e fale com um conjunto de lições para aprender.",
  icons: {
    icon: '/favicon.ico',
  }
};

export default async function RootLayout({ children }) {
  const getCookies = await cookies();
  const tokenCookie = getCookies.get('token');
  const isLogged = tokenCookie ? await authentication.validateByToken(tokenCookie) : null;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body data-color-mode="dark">
        <StyledComponentsRegistry>
          <ThemeProvider colorMode="dark" preventSSRMismatch>
            <BaseStyles style={{
              backgroundColor: 'var(--bgColor-default)',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <AuthProvider isLogged={isLogged}>
                <NavBar />
                {children}
                <Footer />
              </AuthProvider>
            </BaseStyles>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}

