import pandas as pd
import random
import json
from flask import Blueprint, request, jsonify
from openai import OpenAI

webitem_bp = Blueprint("webitem", __name__)

def normalize_gender(gender):
    gender = str(gender).strip().lower()
    if gender in ["여자", "여성", "woman", "female"]:
        return "여성"
    elif gender in ["남자", "남성", "man", "male"]:
        return "남성"
    else:
        return gender

def diverse_filter_products(gender, n=8):
    # 카테고리별 파일 매핑
    file_map = {
        "상의": f"output/{gender}/{gender}__의류__상의.csv",
        "하의": f"output/{gender}/{gender}__의류__하의.csv",
        "셔츠": f"output/{gender}/{gender}__의류__셔츠.csv",
        "아우터": f"output/{gender}/{gender}__의류__아우터.csv",
        "니트웨어": f"output/{gender}/{gender}__의류__니트웨어.csv",
        "스커트": f"output/{gender}/{gender}__의류__스커트.csv",
        "원피스": f"output/{gender}/{gender}__의류__원피스.csv",
        "점프수트": f"output/{gender}/{gender}__의류__점프수트.csv",
    }
    category_pools = {}
    for cat, path in file_map.items():
        try:
            df = pd.read_csv(path)
            if len(df) > 0:
                category_pools[cat] = df
        except Exception:
            continue

    # 1차: 카테고리별로 1개씩 랜덤 추출
    selected = []
    for cat, df in category_pools.items():
        row = df.sample(n=1, random_state=random.randint(0, 10000)).to_dict(orient="records")[0]
        selected.append(row)
        if len(selected) >= n:
            break

    # 2차: 부족하면 전체 pool에서 랜덤 추출로 채움(이미 뽑힌 상품 제외)
    if len(selected) < n:
        all_pool = pd.concat(category_pools.values(), ignore_index=True) if category_pools else pd.DataFrame()
        remain = n - len(selected)
        if len(all_pool) > 0:
            used_names = {row["상품명"] for row in selected}
            remain_df = all_pool[~all_pool["상품명"].isin(used_names)]
            if len(remain_df) > 0:
                extra = remain_df.sample(n=min(remain, len(remain_df)), random_state=random.randint(0, 10000)).to_dict(orient="records")
                selected.extend(extra)
    return selected[:n]

def gpt_recommend_products(user_info, product_list, topn=8):
    client = OpenAI()
    def safe(row, key): return str(row.get(key, "")).strip()
    product_str = "\n".join([
        f"{i+1}. 이름: {safe(row, '상품명')} / 가격: {safe(row, '가격')} / URL: {safe(row, '링크')} / 이미지: {safe(row, '이미지 URL')}"
        for i, row in enumerate(product_list)
    ])
    print("GPT 프롬프트에 들어가는 상품 리스트:\n", product_str)
    prompt = f"""
당신은 패션 쇼핑 추천 전문가입니다.
아래는 사용자의 정보입니다.
성별: {user_info['gender']}
나이: {user_info['age']}
스타일: {user_info.get('style', '')}
날씨: {user_info.get('weather', '')}
날씨정보와 온도/계절을확인하고 성별/나이 를 철저하게 분석해 남성이면 남성의류만 여성이면 여성의류만 추천을해줘

아래는 추천 후보 상품 리스트입니다.
{product_str}

이 중에서 사용자에게 가장 잘 어울릴 것 같은 상품 {topn}개를 골라 아래와 같은 JSON 배열로만 반환하세요.

[
  {{"name": "상품명", "price": "가격", "url": "URL", "image_url": "이미지URL"}},
  ...
]

JSON 배열만 반환하고, 설명 문장이나 다른 텍스트는 포함하지 마세요.
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "너는 상품 추천 전문가야. 반드시 JSON 배열만 반환해."},
            {"role": "user", "content": prompt}
        ]
    )
    try:
        content = response.choices[0].message.content.strip()
        web_products = json.loads(content)
        # GPT가 엉뚱한 결과를 반환할 경우, 후보 상품에서 랜덤 N개 추출 fallback
        if not isinstance(web_products, list) or len(web_products) == 0:
            web_products = []
            for row in random.sample(product_list, min(topn, len(product_list))):
                web_products.append({
                    "name": safe(row, "상품명"),
                    "price": safe(row, "가격"),
                    "url": safe(row, "링크"),
                    "image_url": safe(row, "이미지 URL")
                })
    except Exception as e:
        print(f"GPT 응답 파싱 오류: {e}")
        web_products = []
        for row in random.sample(product_list, min(topn, len(product_list))):
            web_products.append({
                "name": safe(row, "상품명"),
                "price": safe(row, "가격"),
                "url": safe(row, "링크"),
                "image_url": safe(row, "이미지 URL")
            })
    return web_products

@webitem_bp.route("/api/webitem-recommend", methods=["POST"])
def webitem_recommend():
    try:
        data = request.get_json()
        gender = normalize_gender(data.get("gender", "남성"))
        count = data.get("count", 12)  # ★ 기본값 8개로 변경
        age = data.get("age", 25)
        style = data.get("style", None)
        weather = data.get("weather", "")
        user_info = {"gender": gender, "age": age, "style": style, "weather": weather}

        # 카테고리별로 골고루 추천
        candidate_products = diverse_filter_products(gender, n=count)

        if not candidate_products:
            return jsonify({"web_products": [], "success": False, "message": "추천할 상품이 없습니다."}), 200

        web_products = gpt_recommend_products(user_info, candidate_products, topn=count)
        return jsonify({"web_products": web_products, "success": True, "message": "ok"})
    except Exception as e:
        print(f"webitem_recommend 예외: {e}")
        return jsonify({"web_products": [], "success": False, "message": str(e)}), 200
