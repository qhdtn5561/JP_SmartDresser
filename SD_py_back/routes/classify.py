CLOTHING_CATEGORIES = {
    "상의": ["탑", "블라우스", "티셔츠", "니트웨어", "셔츠", "브라탑", "후드티"],
    "하의": ["청바지", "팬츠", "스커트", "래깅스", "조거팬츠"],
    "아우터": ["코트", "재킷", "점퍼", "패딩", "베스트", "가디건", "짚업"],
    "원피스": ["드레스", "점프수트"]
}

def get_main_category(sub_category):
    for main, subs in CLOTHING_CATEGORIES.items():
        if sub_category in subs:
            return main
    return None

from flask import Blueprint, request, jsonify
import torch
from torchvision import transforms, models
from PIL import Image
import requests
from io import BytesIO
import os

classify_bp = Blueprint('classify', __name__)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
idx_to_label = None

def load_model():
    global model, idx_to_label
    model_path = os.path.join(os.path.dirname(__file__), 'kfashion_classifier.pth')
    checkpoint = torch.load(model_path, map_location=device)
    model = models.resnet50(pretrained=False)
    num_ftrs = model.fc.in_features
    model.fc = torch.nn.Sequential(
        torch.nn.Dropout(0.5),
        torch.nn.Linear(num_ftrs, checkpoint['num_classes'])
    )
    model.load_state_dict(checkpoint['model_state_dict'])
    model.to(device)
    model.eval()
    # idx_to_label을 항상 인덱스 오름차순으로 정렬해서 고정
    idx_to_label = {k: v for k, v in sorted(checkpoint['idx_to_label'].items())}

load_model()

val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@classify_bp.route('/classify', methods=['POST'])
def classify_image_url():
    try:
        data = request.get_json()
        image_url = data.get('image_url')
        if not image_url:
            return jsonify({"error": "image_url is required"}), 400

        response = requests.get(image_url)
        if response.status_code != 200:
            return jsonify({"error": "이미지 다운로드 실패"}), 400

        img = Image.open(BytesIO(response.content)).convert('RGB')
        img_t = val_transform(img).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(img_t)
            probs = torch.nn.functional.softmax(outputs, dim=1)
            top_p, top_class = torch.topk(probs, 3, dim=1)
            results = []
            for i in range(top_class.size(1)):
                sub_cat = idx_to_label[top_class[0][i].item()]
                main_cat = get_main_category(sub_cat)
                results.append({
                    "category": sub_cat,
                    "main_category": main_cat,
                    "probability": round(top_p[0][i].item() * 100, 2)
                })
        return jsonify(results)

    except Exception as e:
        print(f"URL 분류 오류: {e}")
        return jsonify({"error": str(e)}), 500
