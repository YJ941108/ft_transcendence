# ft_transcendence
Sucessful Conclusion. It's for final subject, ft_transcendence

# Getting Started

만약 클러스터라면 ./srcs/docker/init_docker.sh를 실행해주세요.

## Environment

.env.sample을 참고해서 .env파일을 만들고 환경변수를 설정해주셔야 합니다.

## Launch

```
docker-compose up --build
```

# Version

2022년 6~8월 LTS를 사용하였습니다. 하지만 docker와 docker-compose는 클러스터 환경입니다.

|Program|Version|
|---|---|
|Docker|17.09.0-ce, build afdb6d4|
|docker-compose|1.16.1, build 6d1ac21|
|NodeJS|16.15.1|

# Adminer 사용법

localhost:8080 접속

|제목|입력|
|---|---|
|데이터베이스 형식|PostgreSQL|
|서버|db|
|사용자이름||
|비밀번호||
|데이터베이스||

# Architecture

## Front

```
.
├── Dockerfile
├── README.md
├── package-lock.json
├── package.json
├── public
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src
│   ├──  GlobalStyle.tsx
│   ├── App.tsx
│   ├── components
│   │   ├──  navbar
│   │   │   └── Navbar.tsx
│   │   └── styles
│   │       └── box
│   │           ├── ContentBox.tsx
│   │           ├── MainBox.tsx
│   │           └── SideBox.tsx
│   ├── index.tsx
│   ├── modules
│   │   ├── cookie.ts
│   │   ├── styled.d.ts
│   │   ├── theme.ts
│   │   └── userData.ts
│   └── routes
│       ├── AuthPage.tsx
│       ├── FriendsPage.tsx
│       ├── GamePage.tsx
│       ├── HomePage.tsx
│       ├── LeaderboardPage.tsx
│       ├── LoginPage.tsx
│       ├── ProfilePage.tsx
│       └── Router.tsx
├── tools
│   └── script.sh
└── tsconfig.json
```

## Back

```
.
├── Dockerfile
├── README.md
├── dist
│   ├── app.module.d.ts
│   ├── app.module.js
│   ├── app.module.js.map
│   ├── config
│   │   ├── configuration.d.ts
│   │   ├── configuration.js
│   │   └── configuration.js.map
│   ├── main.d.ts
│   ├── main.js
│   ├── main.js.map
│   ├── modules
│   │   ├── auth
│   │   │   ├── auth.controller.d.ts
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.controller.js.map
│   │   │   ├── auth.module.d.ts
│   │   │   ├── auth.module.js
│   │   │   ├── auth.module.js.map
│   │   │   ├── auth.service.d.ts
│   │   │   ├── auth.service.js
│   │   │   ├── auth.service.js.map
│   │   │   ├── fortytwo.strategy.d.ts
│   │   │   ├── fortytwo.strategy.js
│   │   │   ├── fortytwo.strategy.js.map
│   │   │   ├── jwt.strategy.d.ts
│   │   │   ├── jwt.strategy.js
│   │   │   └── jwt.strategy.js.map
│   │   ├── health
│   │   │   ├── health.controller.d.ts
│   │   │   ├── health.controller.js
│   │   │   ├── health.controller.js.map
│   │   │   ├── health.module.d.ts
│   │   │   ├── health.module.js
│   │   │   ├── health.module.js.map
│   │   │   ├── health.service.d.ts
│   │   │   ├── health.service.js
│   │   │   └── health.service.js.map
│   │   └── users
│   │       ├── dto
│   │       │   ├── create-user.dto.d.ts
│   │       │   ├── create-user.dto.js
│   │       │   └── create-user.dto.js.map
│   │       ├── users.controller.d.ts
│   │       ├── users.controller.js
│   │       ├── users.controller.js.map
│   │       ├── users.entity.d.ts
│   │       ├── users.entity.js
│   │       ├── users.entity.js.map
│   │       ├── users.module.d.ts
│   │       ├── users.module.js
│   │       ├── users.module.js.map
│   │       ├── users.repository.d.ts
│   │       ├── users.repository.js
│   │       ├── users.repository.js.map
│   │       ├── users.service.d.ts
│   │       ├── users.service.js
│   │       └── users.service.js.map
│   └── tsconfig.build.tsbuildinfo
├── nest-cli.json
├── package.json
├── src
│   ├── app.module.ts
│   ├── config
│   │   └── configuration.ts
│   ├── main.ts
│   └── modules
│       ├── auth
│       │   ├── auth.controller.spec.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   ├── auth.service.spec.ts
│       │   ├── auth.service.ts
│       │   ├── fortytwo.strategy.ts
│       │   └── jwt.strategy.ts
│       ├── health
│       │   ├── health.controller.spec.ts
│       │   ├── health.controller.ts
│       │   ├── health.module.ts
│       │   ├── health.service.spec.ts
│       │   └── health.service.ts
│       └── users
│           ├── dto
│           │   └── create-user.dto.ts
│           ├── users.controller.spec.ts
│           ├── users.controller.ts
│           ├── users.entity.ts
│           ├── users.module.ts
│           ├── users.repository.ts
│           ├── users.service.spec.ts
│           └── users.service.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tools
│   └── script.sh
├── tsconfig.build.json
├── tsconfig.json
└── yarn.lock
```