# WACUS - 홍보사이트

화려한 3D 인터랙션과 GSAP 애니메이션을 활용한 Next.js 홍보사이트입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **3D Graphics**: Three.js, @react-three/fiber, @react-three/drei
- **Animation**: GSAP (GreenSock Animation Platform)
- **SEO**: Next.js Metadata API, Sitemap, Robots.txt

## 주요 기능

- ✅ Three.js를 활용한 3D 스크롤 모션
- ✅ GSAP를 활용한 Path 그리기 애니메이션
- ✅ SEO 최적화 (Metadata, Sitemap, Robots.txt)
- ✅ 이미지 최적화 (Next.js Image 컴포넌트)
- ✅ 폰트 최적화 (Next.js Font Optimization)
- ✅ 반응형 디자인
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

## 프로젝트 구조

```
wacus/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (SEO 메타데이터 포함)
│   ├── page.tsx            # 홈 페이지
│   ├── about/
│   │   └── page.tsx        # About 페이지
│   ├── services/
│   │   └── page.tsx        # Services 페이지
│   ├── contact/
│   │   └── page.tsx        # Contact 페이지
│   ├── sitemap.ts          # 사이트맵 생성
│   ├── robots.ts           # Robots.txt 생성
│   └── globals.css         # 전역 스타일
├── components/
│   ├── Navigation.tsx      # 네비게이션 컴포넌트
│   ├── ThreeScene.tsx      # Three.js 씬 래퍼
│   ├── ScrollAnimation.tsx # 스크롤 애니메이션
│   └── PathAnimation.tsx   # Path 그리기 애니메이션
├── next.config.ts          # Next.js 설정
└── package.json
```

## 환경 변수

`.env.example` 파일을 참고하여 `.env.local` 파일을 생성하세요.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 커스터마이징

### 3D 모델 변경

`app/page.tsx`의 `SceneContent` 컴포넌트를 수정하여 원하는 3D 모델을 추가할 수 있습니다.

### 애니메이션 조정

`components/ScrollAnimation.tsx`와 `components/PathAnimation.tsx`에서 GSAP 애니메이션 설정을 조정할 수 있습니다.

### SEO 설정

`app/layout.tsx`의 `metadata` 객체를 수정하여 SEO 메타데이터를 커스터마이징할 수 있습니다.

## 라이선스

MIT
