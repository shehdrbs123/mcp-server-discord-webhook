# Claude MCP Discord Webhook

## 📌 개요
이 모듈은 Claude MCP 서버의 이벤트를 실시간으로 Discord 채널에 알림으로 전송하는 기능을 제공합니다.

## 🚀 주요 기능
- Claude MCP 서버 이벤트의 실시간 Discord 알림
- 맞춤형 이벤트 메시지 지원
- 간편한 설정 및 통합

## 🔧 Claude MCP 설정 방법

### 1. 환경 설정
`claude_desktop_config.json` 파일에 다음과 같이 설정:

```json
{
  "mcpServers": {
    "discordWebhook": {
      "type": "webhook",
      "url": "YOUR_DISCORD_WEBHOOK_URL",
      "events": [
        "serverStart",
        "serverStop",
        "modelInteraction",
        "errorLog"
      ]
    }
  }
}
```

### 2. Webhook URL 준비
1. Discord 서버의 채널 설정 > 통합
2. 웹훅 생성 > URL 복사

### 3. 지원되는 이벤트 유형
- `serverStart`: MCP 서버 시작 알림
- `serverStop`: MCP 서버 중지 알림
- `modelInteraction`: Claude 모델 상호작용 로그
- `errorLog`: 시스템 오류 및 예외 사항

## 📡 고급 설정

### 이벤트 필터링
특정 이벤트만 알림 받도록 설정 가능:

```json
"events": [
  "modelInteraction",
  "errorLog"
]
```

### 메시지 커스터마이징
`messageTemplate` 속성으로 알림 메시지 형식 지정:

```json
{
  "mcpServers": {
    "discordWebhook": {
      "messageTemplate": {
        "modelInteraction": "New interaction: {model} | Tokens: {tokenCount}"
      }
    }
  }
}
```

## 🛠 트러블슈팅
- Webhook URL 유효성 확인
- 네트워크 방화벽 설정 점검
- 알림 수신 실패 시 로그 확인

## 🤝 기여 방법
1. 이슈 제기
2. 포크 및 풀 리퀘스트

## 📄 라이선스
[라이선스 정보 추가]

**✨ Made for Claude MCP**
