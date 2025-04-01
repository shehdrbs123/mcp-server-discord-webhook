# MCP-server Discord Webhook

## 📌 개요
이 모듈은 MCP 서버에서 실시간으로 Discord 채널에 알림으로 전송하는 기능을 제공합니다.

## 🚀 주요 기능
- mcp-server를 통해 실시간 Discord 알림
- 맞춤형 이벤트 메시지 지원
- 간편한 설정 및 통합

## 🔧 설치 방법

### 2. Webhook URL 준비
1. Discord 서버의 채널 설정 > 연동으로 이동
2. 웹후크 선택
3. 새 웹후크 > URL 복사

### 3. MCP config 설정

```json
"mcpServers": {
  "webhook": {
    "command": "npx",
    "args": [
      "-y",
      "@shehdrbs123/mcp-server-discord-webhook"
    ],
    "env": {
      "WEBHOOK_URL": "YOUR_WEBHOOK_URL"
    },
    "alwaysAllow": [
      "discord_send_message"
    ]
  }
}
```

### 4. mcp 사용법 유튜브 (한글)

출처 : 코드깎는노인

https://www.youtube.com/watch?v=jpWtV08fF-E

## 📄 라이선스

없음 무료!

**✨ Made for Claude**
