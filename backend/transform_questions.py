import json

IN_PATH = 'backend/data/questions.json'

with open(IN_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

count_q = 0
count_opts = 0

for q in data:
    if 'text' in q and isinstance(q['text'], str):
        q['text'] = {'ru': q['text'], 'kz': q['text']}
        count_q += 1
    if 'options' in q and isinstance(q['options'], list):
        for opt in q['options']:
            if 'text' in opt and isinstance(opt['text'], str):
                opt['text'] = {'ru': opt['text'], 'kz': opt['text']}
                count_opts += 1

with open(IN_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Updated {count_q} question texts and {count_opts} option texts in {IN_PATH}.")
