"use client";

import { useState } from "react";

export default function ScheduleUploadPage() {
  const [school, setSchool] = useState(null);
  const [status, setStatus] = useState("");
  const [answers, setAnswers] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSchoolChange = (e) => {
    setSchool(e.target.value);
    setStatus("");
  };

  const API_BASE = process.env.API_BASE || "http://localhost:3000";

  const handleUpload = async () => {

    setLoading(true);
    setStatus("⏳ Загружается...");

    try {
      console.log(school);
      let res = "";
      if (school) {
        res = await fetch(`${API_BASE}/api/answers?school=${encodeURIComponent(school)}`, {
          method: "GET",
        });
      } else {
        res = await fetch(`${API_BASE}/api/answers`, {
          method: "GET",
        });
      }



      const result = await res.json();

      setAnswers(result)

      if (res.ok) {
        setStatus(`✅ Успешно`);
      } else {
        setStatus(`❌ Ошибка: ${result.error || "Неизвестная ошибка"}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Ошибка при отправке запроса");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-black shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          📅 Загрузка расписания
        </h1>

        <input
          type="text"
          onChange={handleSchoolChange}
          className="school-input school-input-bordered school-input-primary w-full mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Загрузка..." : "📤 Отправить"}
        </button>

        {status && (
          <p
            className={`mt-4 text-center font-medium ${
              status.startsWith("✅")
                ? "text-green-600"
                : status.startsWith("❌")
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {status}
          </p>
        )}

        {answers && (
            <div>
                <div>{answers.count}</div>
                {answers.answers.map((item) => (
                    <div key={item.id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
                    {item?.user && (<h3>{item?.user?.name && (item.user.name)} ({item.user.school}, {item.user.grade} класс)</h3>)}
                    <p><b>Анализ:</b> {item.analysis}</p>

                    <h4>Направления и профессии:</h4>
                    {item.matchResults.map((dir) => (
                        <div key={dir.directionId} style={{ marginLeft: "10px" }}>
                        <b>{dir.directionTitle?.ru}</b>
                        <ul>
                            {dir.professions.map((prof) => (
                            <li key={prof.id}>
                                {prof.title?.ru} — score: {prof.score}
                            </li>
                            ))}
                        </ul>
                        </div>
                    ))}

                    <h4>Ответы:</h4>
                    <ul>
                        {Object.entries(item.answers).map(([q, ans]) => (
                        <li key={q}>{q}: {ans}</li>
                        ))}
                    </ul>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
}
