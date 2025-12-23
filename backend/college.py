import json

IN_PATH = 'data/professions.json'

with open(IN_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_data = []
seen_colleges = set()  # Здесь будем хранить уникальные пары названий
count_q = 0

for q in data:
    # Проверяем наличие поля college (в старом формате оно было объектом)
    if 'college' in q and isinstance(q['college'], dict):
        ru_name = q['college'].get('ru', "").strip()
        kz_name = q['college'].get('kz', "").strip()
        
        # Создаем уникальный ключ для проверки дубликатов
        # Используем кортеж, так как он хешируемый и может быть элементом set
        identifier = (ru_name, kz_name)
        
        if identifier not in seen_colleges and (ru_name or kz_name):
            new_item = {
                'id': count_q,
                'title': {
                    'ru': ru_name,
                    'kz': kz_name
                }
            }
            new_data.append(new_item)
            seen_colleges.add(identifier)
            count_q += 1

with open(IN_PATH, 'w', encoding='utf-8') as f:
    json.dump(new_data, f, ensure_ascii=False, indent=2)

print(f"Обработка завершена. Найдено уникальных колледжей: {count_q}")