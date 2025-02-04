require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error("❌ Ошибка: API-ключ OpenAI отсутствует!");
}

app.post("/chat", async (req, res) => {
    console.log("📩 Получено сообщение от пользователя:", req.body.message);

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini-2024-07-18",
                messages: [{ role: "user", content: req.body.message }],
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ Ответ от OpenAI:", response.data);
        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        if (error.response?.status === 429) {
            console.error("❌ Превышен лимит запросов OpenAI, делаем паузу...");
            // Ждём 1 минуту перед повторной попыткой
            await new Promise(resolve => setTimeout(resolve, 60000));  
            return res.status(429).json({ error: "Превышен лимит запросов, попробуйте позже." });
        }
        console.error("❌ Ошибка при запросе к OpenAI:", error.response?.data || error.message);
        res.status(500).json({ error: "Ошибка сервера. Подробнее смотри в логах Railway." });
    }
});

app.listen(3000, () => console.log("🚀 Сервер запущен на порту 3000"));
