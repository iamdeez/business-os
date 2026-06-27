// vitest 에서 `server-only` import 를 무력화하기 위한 빈 스텁.
// 실제 런타임(Next RSC)에서는 server-only 패키지가 클라이언트 import 를 차단하지만,
// 테스트(node/jsdom)에서는 import 자체가 throw 하므로 이 빈 모듈로 alias 한다.
export {};
