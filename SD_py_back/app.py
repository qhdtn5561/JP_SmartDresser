try:
    print("Start app.py...")

    from flask import Flask
    from flask_cors import CORS
    from routes.recommend import recommend_bp
    from routes.classify import classify_bp
    from routes.webitem import webitem_bp      # ★ 웹상품 추천 라우트 임포트

    app = Flask(__name__)
    CORS(app)

    print("✅ Flask app start...")

    app.register_blueprint(recommend_bp)
    app.register_blueprint(classify_bp)
    app.register_blueprint(webitem_bp)         # ★ 웹상품 추천 라우트 등록

    if __name__ == "__main__":
        print("🚀 Flask server loading...")
        app.run(host="0.0.0.0", port=8082, debug=True)

except Exception as e:
    print("❌ ERROR app.py:")
    print(e)
