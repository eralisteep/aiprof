import json
import re
import os
import pandas as pd # type: ignore

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def find_excel_file():
    for file in os.listdir(BASE_DIR):
        if file.startswith('Контингент') and file.endswith('.xlsx'):
            return os.path.join(BASE_DIR, file)
    return None

EXCEL_FILE = find_excel_file()
PROFESSIONS_JSON = os.path.join(BASE_DIR, 'data', 'professions.json')
RESULT_PROFESSIONS = os.path.join(BASE_DIR, 'data', 'professions_updated.json')
RESULT_COLLEGES = os.path.join(BASE_DIR, 'data', 'colleges.json')

def parse_data():
    if not EXCEL_FILE:
        print(f"ОШИБКА: Excel файл не найден.")
        return

    print(f"Использую файл: {os.path.basename(EXCEL_FILE)}")

    try:
        # Читаем все листы на случай, если данные не на первом
        df = pd.read_excel(EXCEL_FILE, dtype=str)
    except Exception as e:
        print(f"Ошибка чтения: {e}")
        return

    colleges_list = []
    college_name_to_id = {}
    prof_to_colleges = {}
    current_college_id = None

    for index, row in df.iterrows():
        # Подготовка данных из колонок
        col1 = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) else ""
        col2 = str(row.iloc[1]).strip() if pd.notna(row.iloc[1]) else ""
        
        # Склеиваем всю строку для поиска кода профессии
        row_full_text = " ".join([str(val) for val in row.values if pd.notna(val)])

        # ЛОГИКА ПОИСКА КОЛЛЕДЖА
        # Проверяем, является ли строка заголовком колледжа:
        # 1. Первая колонка - число (порядковый номер)
        # 2. Во второй колонке есть ключевые слова или это наш "Innovative college"
        is_college_row = False
        if col1.isdigit():
            text_to_check = col2.lower()
            keywords = ["колледж", "училище", "институт", "college", "авиценна", "кайнар"]
            if any(word in text_to_check for word in keywords) or "innovative" in text_to_check:
                is_college_row = True

        if is_college_row:
            # Очистка названия: убираем "в том числе", кавычки и лишние пробелы
            name_clean = re.sub(r'[,]?\s*в том числе.*', '', col2, flags=re.IGNORECASE).strip()
            # name_clean = re.sub(r'[,]?\s*втом числе.*', '', col2, flags=re.IGNORECASE).strip()
            name_clean = name_clean.replace('"', '').replace('«', '').replace('»', '')
            
            if name_clean not in college_name_to_id:
                c_id = len(colleges_list)
                college_name_to_id[name_clean] = c_id
                colleges_list.append({
                    "id": str(c_id),
                    "title": {"ru": name_clean, "kz": ""}
                })
            current_college_id = college_name_to_id[name_clean]
            continue

        # ЛОГИКА ПОИСКА ПРОФЕССИИ
        # Ищем 8-значный код (например, 06130100)
        prof_match = re.search(r'(\d{8})', row_full_text)
        if prof_match and current_college_id is not None:
            prof_id = prof_match.group(1)
            if prof_id not in prof_to_colleges:
                prof_to_colleges[prof_id] = set()
            prof_to_colleges[prof_id].add(current_college_id)

    print(f"\n--- Итоги парсинга ---")
    print(f"Всего найдено уникальных колледжей: {len(colleges_list)}")
    
    # Проверка наличия Innovative college в итоговом списке для отладки
    found_innovative = any("innovative" in c['title']['ru'].lower() for c in colleges_list)
    print(f"Innovative college найден: {'ДА' if found_innovative else 'НЕТ'}")

    # Обновление JSON
    if os.path.exists(PROFESSIONS_JSON):
        with open(PROFESSIONS_JSON, 'r', encoding='utf-8') as f:
            existing_profs = json.load(f)

        updated_count = 0
        for p in existing_profs:
            p_id = str(p.get('id', ''))
            if p_id in prof_to_colleges:
                # Превращаем ID колледжей в строки
                p['collegeIds'] = [str(i) for i in prof_to_colleges[p_id]]
                updated_count += 1
            else:
                p['collegeIds'] = []
            
            if 'college' in p: del p['college']

        with open(RESULT_PROFESSIONS, 'w', encoding='utf-8') as f:
            json.dump(existing_profs, f, ensure_ascii=False, indent=2)
        
        with open(RESULT_COLLEGES, 'w', encoding='utf-8') as f:
            json.dump(colleges_list, f, ensure_ascii=False, indent=2)

        print(f"Профессий обновлено в JSON: {updated_count}")
        print(f"Данные сохранены в папку 'data'")
    else:
        print(f"Ошибка: Не найден {PROFESSIONS_JSON}")

if __name__ == "__main__":
    parse_data()