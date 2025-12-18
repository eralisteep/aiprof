import React, { useState } from 'react';
import QrScanner from 'qr-scanner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  const startScan = async () => {
    setScanning(true);
    try {
      const result = await QrScanner.scanImage(); // For file upload, or use camera
      const qrCode = result.data;
      // Start session
      const response = await axios.post('/api/start-session', { qrCode });
      const { sessionId } = response.data;
      navigate(`/test/${sessionId}`);
    } catch (error) {
      console.error('QR scan failed', error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      <h2>Сканируйте QR-код для начала тестирования</h2>
      <button onClick={startScan} disabled={scanning}>
        {scanning ? 'Сканирование...' : 'Начать сканирование'}
      </button>
      <p>Или введите код вручную:</p>
      <input type="text" placeholder="QR код" onChange={(e) => {
        const qrCode = e.target.value;
        if (qrCode) {
          axios.post('/api/start-session', { qrCode }).then(response => {
            navigate(`/test/${response.data.sessionId}`);
          });
        }
      }} />
    </div>
  );
};

export default QRScanner;