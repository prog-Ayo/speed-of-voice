const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@deepgram/sdk');
require('dotenv').config();

const app = express();
const port = 3000;

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// تخزين الملفات المؤقتة
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'uploaded' + ext); // يخزن الملف مع الامتداد الصحيح
  }
});
const upload = multer({ storage });

app.use(express.static('public'));

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const audioPath = path.join(__dirname, 'uploads', req.file.filename);
    const buffer = fs.readFileSync(audioPath);
    const duration = parseFloat(req.body.duration) || 1;

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(buffer, {
      smart_format: true
    });

    if (error) throw error;

    const transcript = result.results.channels[0].alternatives[0].transcript || '';
    const wordCount = transcript.trim().split(/\s+/).length;
    const speed = wordCount / duration;

    let category = 'غير معروف';
    if (speed < 2) category = '🟢 Slow ';
    else if (speed < 4) category = '🟡 Medium';
    else category = '🔴 Fast';

    res.json({ transcript, wordCount, speed, category });
  } catch (err) {
    console.error('❌ خطأ:', err);
    res.status(500).json({ error: 'فشل تحليل الملف الصوتي' });
  }
});

app.listen(port, () => {
  console.log(`🚀 السيرفر شغّال على http://localhost:${port}`);
});