import json
import os
import time
from deep_translator import GoogleTranslator # type: ignore

def translate_fields(obj, translator):
    count = 0
    if isinstance(obj, dict):
        if "ru" in obj and "kz" in obj:
            # Переводим только если kz пустой
            if obj["ru"] and (not obj.get("kz") or str(obj["kz"]).strip() == ""):
                try:
                    # Добавляем небольшую задержку, чтобы Google не банил
                    time.sleep(0.4) 
                    obj["kz"] = translator.translate(obj["ru"])
                    print(f"Переведено: {obj['ru']} -> {obj['kz']}")
                    return 1 # Возвращаем 1 для счетчика
                except Exception as e:
                    print(f"Ошибка на '{obj['ru']}': {e}")
                    # Если поймали бан, подождем подольше
                    if "429" in str(e) or "Max retries" in str(e):
                        print("Пауза 10 секунд (защита от блокировки)...")
                        time.sleep(10)
        
        for key, value in obj.items():
            count += translate_fields(value, translator)
            
    elif isinstance(obj, list):
        for item in obj:
            count += translate_fields(item, translator)
    return count

def main():
    input_file = os.path.join('data', 'colleges.json')
    output_file = os.path.join('data', 'professions_translated.json')

    if not os.path.exists(input_file):
        print(f"Файл не найден: {input_file}")
        return

    translator = GoogleTranslator(source='ru', target='kk')

    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("Начинаю перевод. Нажмите Ctrl+C для остановки (прогресс сохранится).")
    
    try:
        total = translate_fields(data, translator)
        print(f"Успешно переведено новых полей: {total}")
    except KeyboardInterrupt:
        print("\nПеревод прерван пользователем. Сохраняю то, что успели...")

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Данные сохранены в {output_file}")

if __name__ == "__main__":
    main()