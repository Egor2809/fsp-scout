/**
 * Источник access token для HTTP-клиента. Провайдер авторизации регистрирует
 * функцию получения токена при старте приложения (dev или OIDC).
 */
type TokenGetter = () => Promise<string | null> | string | null

let tokenGetter: TokenGetter = () => null

export function setAccessTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter
}

export async function getAccessToken(): Promise<string | null> {
  return await tokenGetter()
}
