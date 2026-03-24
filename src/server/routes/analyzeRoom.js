// server/routes/analyzeRoom.js
import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.post('/', async (req, res) => {
  const { logs, tank_name } = req.body;

  if (!logs?.length) return res.status(400).json({ error: 'No logs provided' });

  const latestLogs = logs.slice(0, 10);
  const prompt = `You are an expert tank monitoring AI.
  Tank: ${room.tank_name}
  Recent Logs: ${latestLogs.map(l => `- Level: ${l.level}, Temp: ${l.temperature}°C, Humidity: ${l.humidity}%, Anomalies: ${l.anomalies?.length || 0}, Time: ${l.timestamp || l.created_at}`).join('\n')}

Analyze these logs and provide a concise 3-line report:
1 - SITUATION: Overall condition and trend
2 - ROOT CAUSE: Likely technical issue
3 - ACTION: Corrective measures required

Be concise, technical, and precise. No bullet points.`;


  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Unable to generate analysis.';
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI engine unreachable' });
  }
});

export default router;
