"use client";

import { useState } from "react";
import { withAdminProtection } from "@/src/hoc/withAdminProtection";

function ScheduleUploadPage() {
  const [school, setSchool] = useState(null);
  const [status, setStatus] = useState("");
  const [answers, setAnswers] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSchoolChange = (e) => {
    setSchool(e.target.value);
    setStatus("");
  };

  const NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  const handleUpload = async () => {

    setLoading(true);
    setStatus("⏳ Загружается...");

    try {
      let res = "";
      if (school) {
        res = await fetch(`${NEXT_PUBLIC_API_BASE}/api/answers?school=${encodeURIComponent(school)}`, {
          method: "GET",
          credentials: "include"

        });
      } else {
        res = await fetch(`${NEXT_PUBLIC_API_BASE}/api/answers`, {
          method: "GET",
          credentials: "include"

        });
      }



      const result = await res.json();

      await setAnswers(result)
      console.log(answers)


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


        <input
          type="text"
          onChange={handleSchoolChange}
          className="school-input school-input-bordered school-input-primary w-full mb-4 p-0"
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
          <div className="mt-8 p-6 bg-slate-900/50 rounded-2xl border border-white/10 shadow-xl">
            {/* <div className="flex items-center justify-between mb-6 stats"> */}

              {/* <h3 className="text-xl font-bold text-white">Статистика по школам</h3>
              <span className="badge badge-primary badge-lg p-4 gap-2">
                Всего ответов: <span className="font-mono font-bold">{answers.answers.count}</span>
              </span>
            </div> */}

            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="table table-zebra w-full">
                <tbody className="text-gray-200">
                  <tr className="border-b border-white/10 rounded-xl border border-white/5">
                    <th className="bg-slate-800 text-white font-semibold uppercase text-xs tracking-wider">Школы</th>
                    <th className="bg-slate-800 text-white font-semibold uppercase text-xs tracking-wider">Всего ответов:{answers.answers.count}</th>
                  </tr>
                    {answers.answers.answers.map((item) => (
                      <tr>
                        <td key={item.school} className="text-center font-medium min-w-[120px]">
                          {(isNaN(item.school))?(
                            item.school
                          ):(
                            <>Школа №{item.school}</>
                          )
                          }
                        </td>
                        <td key={item.school} className="text-center">
                          <span className="badge badge-ghost font-mono">{item.count}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* 
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
        )} */}
      </div>

    </div>
  );
}

export default withAdminProtection(ScheduleUploadPage);
