import React, { useState } from 'react';
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QRGenerator = () => {
  const [qrCode, setQrCode] = useState('');
  const [qrData, setQrData] = useState('');

  const generateQR = async () => {
    const uniqueCode = `aiprof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setQrData(uniqueCode);
    try {
      const qr = await QRCode.toDataURL(uniqueCode);
      setQrCode(qr);
    } catch (error) {
      console.error('Failed to generate QR', error);
    }
  };

  return (
    <div>
      <h2>Генератор QR для тестирования</h2>
      <button onClick={generateQR}>Сгенерировать QR</button>
      {qrCode && (
        <div>
          <img src={qrCode} alt="QR Code" />
          <p>Код: {qrData}</p>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;