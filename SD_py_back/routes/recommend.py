from flask import Blueprint, request, jsonify
from gpt.recommend_outfit import recommend_outfit

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/api/gpt-outfit", methods=["POST"])
def gpt_outfit():
    try:
        data = request.get_json()
        required = ["gender", "age", "style", "weather", "availableItems"]
        for key in required:
            if key not in data:
                return jsonify({"recommendation": None, "success": False, "message": f"'{key}' 파라미터가 필요합니다."}), 400

        events = data.get("events", [])
        events_str = ""
        if events:
            events_str = "\n오늘의 주요 일정:\n"
            for ev in events:
                time = ev.get("time", "")
                title = ev.get("title", "")
                note = ev.get("note", "")
                if note:
                    events_str += f"- {time} {title} ({note})\n"
                else:
                    events_str += f"- {time} {title}\n"

        available_items_str = ', '.join(str(i) for i in data['availableItems'])
        prompt = f"""
당신은 패션 전문가입니다.
사용자 정보: 성별 {data['gender']}, 나이 {data['age']}세, 스타일 {data['style']}
날씨 정보: 기온 {data['weather']['temperature']}도, 상태: {data['weather']['condition']}
{events_str}
보유한 옷장 아이템 id: [{available_items_str}]

아래와 같은 형식으로 코디를 1개 추천해주세요.
반드시 items 배열에는 위의 '보유한 옷장 아이템 id' 중에서만 골라서 추천하고,
items 값은 반드시 availableItems에서 받은 id만 사용하세요.

{{
  "outfits": [
    {{
      "name": "코디 이름 (예: 미니멀 시크)",
      "description": "코디 설명 (예: 심플하면서도 세련된 분위기를 연출하는 룩)",
      "items": [123, 456]
    }}
  ]
}}

JSON 형식만 반환하고, 설명 문장이나 다른 텍스트는 포함하지 마세요.
"""
        gpt_result = recommend_outfit(prompt)
        return jsonify({"recommendation": gpt_result, "success": True, "message": "ok"})
    except Exception as e:
        print(f"gpt_outfit 예외: {e}")
        return jsonify({"recommendation": None, "success": False, "message": str(e)}), 200
