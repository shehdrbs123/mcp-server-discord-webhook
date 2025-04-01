# MCP Server Discord Webhook

## 소개
이 저장소는 서버 이벤트를 Discord 채널로 전송하는 Webhook 기능을 제공합니다.

## 기능
- 서버 이벤트를 Discord 채널로 실시간 알림
- 커스터마이징 가능한 메시지 포맷
- 간편한 설정 방법

## 설치 및 설정

### 필요 조건
- Node.js (버전 14 이상)
- Discord 서버의 Webhook URL

### 설치 방법
1. 저장소 클론
```bash
git clone https://github.com/shehdrbs123/mcp-server-discord-webhook.git
cd mcp-server-discord-webhook
```

2. 종속성 설치
```bash
npm install
```

### 설정 파일 구성
프로젝트 루트에 `config.json` 파일을 생성하고 다음과 같이 설정하세요:

```json
{
  "discordWebhookUrl": "YOUR_DISCORD_WEBHOOK_URL_HERE",
  "events": [
    "serverStart",
    "serverStop",
    "playerJoin",
    "playerLeave"
  ]
}
```

### Webhook URL 얻는 방법
1. Discord 서버의 채널 설정으로 이동
2. '통합' 또는 'Webhooks' 섹션 선택
3. '새 Webhook 생성' 클릭
4. Webhook URL 복사

### 실행 방법
```bash
npm start
```

## 고급 설정
- 특정 이벤트만 알림 받기
- 맞춤형 메시지 템플릿 지정
- 다중 Webhook 지원

## 트러블슈팅
- Webhook URL이 올바른지 확인
- 네트워크 방화벽 설정 점검
- Node.js 버전 호환성 확인

## 기여 방법
1. 포크(Fork) 생성
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. 풀 리퀘스트 열기

## 라이선스
[라이선스 정보 추가]
