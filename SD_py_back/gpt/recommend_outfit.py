from openai import OpenAI
from dotenv import load_dotenv
import os
import json

# .env 파일에서 API 키를 불러오기
load_dotenv()

# OpenAI 클라이언트 초기화
client = OpenAI()

def recommend_outfit(prompt: str) -> list:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "당신은 패션 전문가입니다. JSON 형식으로만 정확하게 답변해주세요. 추가 텍스트는 포함하지 마세요."},
            {"role": "user", "content": prompt}
        ]
    )

    raw = response.choices[0].message.content
    print("🧠 GPT 원시 응답:\n", raw)

    # 🔥 앞쪽 공백 줄 제거 — 불필요한 공백 제거
    return json.loads(raw.strip())
