const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const cache = new Map(); // Простое кеширование

app.use(express.json());

// Логирование всех входящих запросов
app.use((req, res, next) => {
    console.log(`📩 Получен запрос: ${req.method} ${req.url}`);
    if (req.body) console.log("📦 Данные:", JSON.stringify(req.body));
    next();
});

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    // Проверяем, есть ли ответ в кеше
    if (cache.has(userMessage)) {
        console.log("✅ Ответ из кеша");
        return res.json({ reply: cache.get(userMessage) });
    }

    console.log(`🚀 Отправляем запрос в OpenAI: ${userMessage}`);

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }],
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const botReply = response.data.choices[0].message.content;
        cache.set(userMessage, botReply); // Сохраняем в кеш

        console.log("✅ Ответ от OpenAI:", botReply);
        res.json({ reply: botReply });
    } catch (error) {
        if (error.response?.status === 429) {
            console.error("❌ Превышен лимит запросов OpenAI, делаем паузу...");
            await new Promise(resolve => setTimeout(resolve, 300000)); // 5 минут
            return res.status(429).json({ error: "Лимит запросов превышен. Попробуйте позже." });
        }
        console.error("❌ Ошибка при запросе к OpenAI:", error.response?.data || error.message);
        res.status(500).json({ error: "Ошибка сервера." });
    }
});

app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
