"use client";

import { useState } from "react";

export default function ScheduleUploadPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.value);
    setStatus("");
  };

  const handleUpload = async () => {


    setLoading(true);
    setStatus("⏳ Загружается...");

    try {
      const formData = new FormData();

      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("http://localhost:3000/api/answers", {
        method: "GET",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setStatus(`✅ Успешно: ${result.message}`);
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
          onChange={handleFileChange}
          className="file-input file-input-bordered file-input-primary w-full mb-4"
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
      </div>

    </div>
  );
}
