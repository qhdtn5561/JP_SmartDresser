import os
import time
import requests
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# 여성/남성 카테고리 (정확한 이름으로 수정)
categories = {
    # 여성
    "여성 > 의류 > 상의": "https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=268100100&categoryMediumCode=268103100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",
    "여성 > 의류 > 바지": "https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=268100100&categoryMediumCode=268106100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",
    "여성 > 의류 > 스커트": "https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=268100100&categoryMediumCode=268107100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",
    "여성 > 의류 > 셋업": "https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=268100100&categoryMediumCode=268117100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",
    "여성 > 의류 > 원피스":"https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=268100100&categoryMediumCode=268104100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",
    "여성 > 의류 > 점프수트":"https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=268100100&categoryMediumCode=268115100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",
    "여성 > 의류 > 아우터":"https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=268100100&categoryMediumCode=268102100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",
    "여성 > 의류 > 니트웨어":"https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=268100100&categoryMediumCode=268105100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",

    # 남성
    "남성 > 의류 > 아우터": "https://shop.29cm.co.kr/category/list?categoryLargeCode=272100100&categoryMediumCode=272102100&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC",
    "남성 > 의류 > 상의": "https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=272100100&categoryMediumCode=272103100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",
    "남성 > 의류 > 하의": "https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=272100100&categoryMediumCode=272104100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",
    "남성 > 의류 > 셋업": "https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=272100100&categoryMediumCode=272112100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",
    "남성 > 의류 > 니트웨어": "https://shop.29cm.co.kr/category/list?colors=&categoryLargeCode=272100100&categoryMediumCode=272110100&categorySmallCode=&minPrice=&maxPrice=&isFreeShipping=&excludeSoldOut=&isDiscount=&brands=&sort=RECOMMEND&defaultSort=RECOMMEND&sortOrder=DESC&tag=&extraFacets=&attributes=",
}

def safe_filename(name):
    return ''.join(c for c in name if c.isalnum() or c in [' ', '.', '-', '_']).strip().replace(' ', '_')[:50]

def download_image(img_url, brand, product_name):
    os.makedirs(f"images/{brand}", exist_ok=True)
    ext = img_url.split('.')[-1].split('?')[0]
    filename = f"images/{brand}/{safe_filename(product_name)}.{ext}"
    if not os.path.exists(filename):
        try:
            res = requests.get(img_url)
            with open(filename, "wb") as f:
                f.write(res.content)
            print(f"🖼️ 저장됨: {filename}")
        except Exception as e:
            print(f"❗ 이미지 저장 실패: {e}")
    return filename

# 셀레니움 설정
options = webdriver.ChromeOptions()
options.add_argument('--start-maximized')
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

# 카테고리 순회
for category_name, base_url in categories.items():
    # 중복 page = 제거
    if '&page=' in base_url:
        base_url = base_url.split('&page=')[0]
        
    print(f"🚀 크롤링 시작: {category_name}")
    data = []

    for page in range(1, 10): # 숫자 1, 2 입력시 첫페이지 크롤링 1,~@ 입력시 전체 크롤롤
        paged_url = f"{base_url}&page={page}"
        print(f"👉 페이지 {page} 요청 중: {paged_url}")
        driver.get(paged_url)
        time.sleep(5)# 스크롤 time 설정 

        # ✅ 스크롤을 끝까지 내려서 모든 상품 로딩
        prev_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(6)
            curr_height = driver.execute_script("return document.body.scrollHeight")
            if curr_height == prev_height:
                break
            prev_height = curr_height

        try:
            products = WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'div.mb-20.space-y-12[role="button"]'))
            )
        except:
            print(f"❗ 상품 없음 또는 마지막 페이지: page {page}")
            break

        if len(products) == 0:
            print(f"✅ 마지막 페이지 도달: page {page}")
            break

        for product in products:
            try:
                link = product.find_element(By.TAG_NAME, "a").get_attribute("href")
                img_url = product.find_element(By.TAG_NAME, "img").get_attribute("src")
                info_box = product.find_element(By.CSS_SELECTOR, "div.text-on-color-dark")
                divs = info_box.find_elements(By.TAG_NAME, "div")
                name = divs[0].text if len(divs) > 0 else "상품명 없음"
                price = divs[1].text if len(divs) > 1 else "가격 없음"
                brand = name.split()[0] if len(name.split()) > 0 else "기타"
                image_path = download_image(img_url, brand, name)

                data.append({
                    "카테고리": category_name,
                    "페이지": page,
                    "상품명": name,
                    "브랜드": brand,
                    "가격": price,
                    "링크": link,
                    "이미지 경로": image_path,
                    "이미지 URL": img_url
                })
            except Exception as e:
                print("❗ 상품 파싱 실패:", e)
                continue

    if data:
        os.makedirs("output", exist_ok=True)
        df = pd.DataFrame(data)
        gender_folder = "여성" if category_name.startswith("여성") else "남성"
        os.makedirs(f"output/{gender_folder}", exist_ok=True)
        csv_path = f"output/{gender_folder}/{safe_filename(category_name)}.csv"
        df.to_csv(csv_path, index=False, encoding="utf-8-sig")
        print(f"✅ 저장 완료: {csv_path}")

driver.quit()
print("\n🎉 전체 페이지 크롤링 완료!")

