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
