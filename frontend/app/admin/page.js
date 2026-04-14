"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { withAdminProtection } from "@/src/hoc/withAdminProtection";

function ScheduleUploadPage() {
  const [school, setSchool] = useState(null);
  const [status, setStatus] = useState("");
  const [answers, setAnswers] = useState("")
  const [loading, setLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("");

  const handleSchoolChange = (e) => {
    setSchool(e.target.value);
    setStatus("");
  };

  const NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

  const handleDownloadPDF = async () => {
    try {
      // Create temporary HTML element
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';

      let htmlContent = `
        <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Результаты тестирования</h1>
      `;

      if (selectedSchool) {
        // Show detailed results for selected school
        const schoolData = answers.answers.find(item => item.school.toString() === selectedSchool.toString());

        if (schoolData && schoolData.answers) {
          htmlContent += `
            <h2 style="color: #666; margin-bottom: 15px;">${isNaN(selectedSchool) ? selectedSchool : `Школа №${selectedSchool}`}</h2>
            <p style="margin-bottom: 20px;"><strong>Всего учеников:</strong> ${schoolData.count}</p>
          `;

          schoolData.answers.forEach((student, index) => {
            htmlContent += `
              <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 8px; page-break-inside: avoid;">
                <h3 style="color: #333; margin-bottom: 10px; border-bottom: 2px solid #007bff; padding-bottom: 5px;">
                  ${index + 1}. ${student.user?.name || 'Неизвестный ученик'} (${student.user?.school || ''}, ${student.user?.grade || ''} класс)
                </h3>
            `;

            // Personality traits
            if (student.profile?.personality) {
              htmlContent += `<h4 style="color: #555; margin-top: 15px;">Личностные характеристики:</h4>`;

              // Core traits
              if (student.profile.personality.core_traits) {
                htmlContent += `<h5 style="color: #666; margin-top: 10px;">Основные черты:</h5><ul>`;
                Object.entries(student.profile.personality.core_traits).forEach(([key, trait]) => {
                  if (key !== 'title' && trait.value !== undefined) {
                    htmlContent += `<li><strong>${trait.ru}:</strong> ${(trait.value * 100).toFixed(0)}%</li>`;
                  }
                });
                htmlContent += `</ul>`;
              }

              // Social traits
              if (student.profile.personality.social_traits) {
                htmlContent += `<h5 style="color: #666; margin-top: 10px;">Социальные черты:</h5><ul>`;
                Object.entries(student.profile.personality.social_traits).forEach(([key, trait]) => {
                  if (key !== 'title' && trait.value !== undefined) {
                    htmlContent += `<li><strong>${trait.ru}:</strong> ${(trait.value * 100).toFixed(0)}%</li>`;
                  }
                });
                htmlContent += `</ul>`;
              }

              // Cognitive traits
              if (student.profile.personality.cognitive_traits) {
                htmlContent += `<h5 style="color: #666; margin-top: 10px;">Когнитивные черты:</h5><ul>`;
                Object.entries(student.profile.personality.cognitive_traits).forEach(([key, trait]) => {
                  if (key !== 'title' && trait.value !== undefined) {
                    htmlContent += `<li><strong>${trait.ru}:</strong> ${(trait.value * 100).toFixed(0)}%</li>`;
                  }
                });
                htmlContent += `</ul>`;
              }
            }

            // Interests
            if (student.profile?.interests) {
              htmlContent += `<h4 style="color: #555; margin-top: 15px;">Интересы:</h4><ul>`;
              Object.entries(student.profile.interests).forEach(([key, interest]) => {
                if (interest.value !== undefined && interest.ru) {
                  htmlContent += `<li><strong>${interest.ru}:</strong> ${(interest.value * 100).toFixed(0)}%</li>`;
                }
              });
              htmlContent += `</ul>`;
            }

            // Match results
            if (student.matchResults && student.matchResults.length > 0) {
              htmlContent += `<h4 style="color: #555; margin-top: 15px;">Рекомендуемые направления:</h4>`;
              student.matchResults.forEach(direction => {
                htmlContent += `<h5 style="color: #666; margin-top: 10px;">${direction.directionTitle?.ru || direction.directionId}</h5><ul>`;
                if (direction.professions && direction.professions.length > 0) {
                  direction.professions.forEach(prof => {
                    htmlContent += `<li><strong>${prof.title?.ru || prof.id}</strong> (рейтинг: ${(prof.score * 100).toFixed(1)}%)`;
                    if (prof.colleges && prof.colleges.length > 0) {
                      htmlContent += `<br><small>Колледжи: ${prof.colleges.map(c => c.title?.ru || c.id).join(', ')}</small>`;
                    }
                    htmlContent += `</li>`;
                  });
                }
                htmlContent += `</ul>`;
              });
            }

            // Analysis
            if (student.analysis) {
              htmlContent += `<h4 style="color: #555; margin-top: 15px;">Анализ:</h4>`;
              htmlContent += `<div style="background-color: #f9f9f9; padding: 10px; border-radius: 4px; white-space: pre-line;">${student.analysis}</div>`;
            }

            htmlContent += `</div>`;
          });
        }
      } else {
        // Show summary for all schools
        htmlContent += `
          <div style="margin-bottom: 20px;">
            <p><strong>Всего ответов:</strong> ${answers.count}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Школа</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Количество ответов</th>
              </tr>
            </thead>
            <tbody>
        `;

        answers.answers.forEach((item, index) => {
          const schoolText = isNaN(item.school) ? item.school : `Школа №${item.school}`;
          const rowStyle = index % 2 === 0 ? 'background-color: #fafafa;' : '';
          htmlContent += `
            <tr style="${rowStyle}">
              <td style="border: 1px solid #ddd; padding: 12px;">${schoolText}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.count}</td>
            </tr>
          `;
        });

        htmlContent += `
            </tbody>
          </table>
        `;
      }

      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      // Generate canvas from HTML
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempDiv.scrollHeight
      });

      // Remove temporary element
      document.body.removeChild(tempDiv);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      const schoolSuffix = selectedSchool ? `_${selectedSchool}` : '_all';
      pdf.save(`results${schoolSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setStatus("❌ Ошибка при создании PDF");
    }
  };

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

      await setAnswers(result.answers)


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
            {console.log(answers)}
            {/* <div className="flex items-center justify-between mb-6 stats"> */}

              {/* <h3 className="text-xl font-bold text-white">Статистика по школам</h3>
              <span className="badge badge-primary badge-lg p-4 gap-2">
                Всего ответов: <span className="font-mono font-bold">{answers.count}</span>
              </span>
            </div> */}

            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="table table-zebra w-full">
                <tbody className="text-gray-200">
                  <tr className="border-b border-white/10 rounded-xl border border-white/5">
                    <th className="bg-slate-800 text-white font-semibold uppercase text-xs tracking-wider">Школы</th>
                    <th className="bg-slate-800 text-white font-semibold uppercase text-xs tracking-wider">Всего ответов:{answers.count}</th>
                  </tr>
                    {answers.answers.map((item) => (
                      <tr>
                        <td key={item.school} className="text-center font-medium min-w-[120px]">
                          {(isNaN(item.school))?(
                            item.school
                          ):(
                            <>Школа №{item.school}</>
                          )
                          }
                        </td>
                        <td key={item.school + "c"} className="text-center">
                          <span className="badge badge-ghost font-mono">{item.count}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <h2>
              Скачать результаты в PDF
            </h2>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="select select-bordered w-full mb-4"
            >
              <option value="">Все школы (статистика)</option>
              {answers.answers.map((item) => (
                <option key={item.school} value={item.school}>
                  {(isNaN(item.school))?(
                    item.school
                  ):(
                    <>Школа №{item.school} (детальные результаты)</>
                  )}
                </option>
              ))}
            </select>
            <button
              onClick={handleDownloadPDF}
              className="btn btn-primary w-full"
            >
              📥 Скачать PDF
            </button>
          </div>
        )}

      {/* 
        {answers && (
            <div>
                <div>{answers.count}</div>
                {answers.map((item) => (
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
