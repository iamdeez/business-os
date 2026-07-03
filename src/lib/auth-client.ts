import { createAuthClient } from "better-auth/react";

// baseURL 미지정 — 브라우저에서 현재 origin(window.location.origin)을 자동 사용한다.
// NEXT_PUBLIC_APP_URL 은 빌드 시점 인라인되어 배포 도메인과 불일치(CORS) 를 유발하므로 쓰지 않는다.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
