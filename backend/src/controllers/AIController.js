import axios from "axios";

const OPENAI_API_KEY = process.env.CHATGPT_API_KEY;

async function analyzeTestResult(answers, groupedProfile, matchResults, language, questions) {
language? language = language : language = "ru";

if (!OPENAI_API_KEY) {
    console.error("Ключ OpenAI API отсутствует. Проверьте переменные окружения.");
    throw new Error("Ключ OpenAI API не найден. Обратитесь к администратору.");
}

// Формируем промпт для анализа
let prompt = "";
if(language !== "ru"){
    prompt = `Пайдаланушының тест нәтижелерін сұрақтар мен жауаптар бойынша талдаңыз. Қысқаша және нақты жауап беріңіз: қандай мамандықтар пайдаланушыға сәйкес, қандай дағдыларды дамыту керек, және 1-2 ұсыныс беріңіз. Жауап форматы: қысқа мәтін.

Сұрақтар:
${questions.map((q, i) => `${i+1}. ${q.text.ru}`).join("n")}

Пайдаланушының жауаптары (нұсқалар нөмірлері бойынша):
${Object.entries(answers).map(([qid, ans]) => `${qid}: ${ans}`).join(", ")}

Пайдаланушы профилі: ${JSON.stringify(groupedProfile)}

Бағыттарды сәйкестендіру нәтижелері: ${JSON.stringify(matchResults)}`;
} else {
    prompt = `Проанализируй результаты теста пользователя по вопросам и ответам. Ответь кратко и по делу: какие профессии подходят пользователю, над какими навыками стоит поработать, и дай 1-2 рекомендации. Формат ответа: короткий текст.\n\nВопросы:\n${questions.map((q, i) => `${i+1}. ${q.text.ru}`).join("\n")}\n\nОтветы пользователя (номера вариантов):\n${Object.entries(answers).map(([qid, ans]) => `${qid}: ${ans}`).join(", ")}\n\nПрофиль пользователя: ${JSON.stringify(groupedProfile)}\n\nРезультаты матчинга направлений: ${JSON.stringify(matchResults)}`;
}
console.log(language)
console.log("Промпт для OpenAI:", prompt);
const content = `${language !== "ru"
? "Сен кәсіби бағдар беру саласының сарапшысысың. Жауаптарды қысқа, құрылымды және нақты бер. Сен тек қазақ тілінде жауап бересің. Орыс тілінде жауап беруге ҚАТАҢ ТЫЙЫМ САЛЫНАДЫ."
: "Ты эксперт по профориентации. Отвечай кратко, структурированно и только по делу на языке. Ты отвечаешь только на русском языке."}`
console.log("Системное сообщение для OpenAI:", content);
try {
    const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
        model: "gpt-3.5-turbo",
        messages: [
        {
            role: "system",
            content: content
        },
        { role: "user", content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.6,
    },
    {
        headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        },
    }
    );

    const resultText = response.data.choices?.[0]?.message?.content;
    console.log("Ответ OpenAI:", resultText);
    if (!resultText) {
    throw new Error("Ответ OpenAI пустой или некорректный.");
    }
    console.log("Анализ результата теста:", resultText.trim());
    return resultText;
} catch (error) {
    console.error("Ошибка анализа теста:", error.response?.data || error.message);
}
}

export default analyzeTestResult;