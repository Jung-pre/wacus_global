# WACUS - 홍보사이트

화려한 3D 인터랙션과 GSAP 애니메이션을 활용한 Next.js 홍보사이트입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **3D Graphics**: Three.js, @react-three/fiber, @react-three/drei
- **Animation**: GSAP (GreenSock Animation Platform)
- **SEO**: Next.js Metadata API, Sitemap, Robots.txt

## 주요 기능

- ✅ 4개 페이지 (Home, About, Services, Contact)

## 시작하기

### 설치

```bash
yarn install
```

### 개발 서버 실행

```bash
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
yarn build
```

### 프로덕션 실행

```bash
yarn start
```

## 환경 변수

`.env.example` 파일을 참고하여 `.env.local` 파일을 생성하세요.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 커스터마이징

### 3D 모델 변경


### SEO 설정

`app/layout.tsx`의 `metadata` 객체를 수정하여 SEO 메타데이터를 커스터마이징할 수 있습니다.

