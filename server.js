const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(express.json());

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        if (!userMessage) {
            return res.status(400).json({ error: "Сообщение не может быть пустым" });
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }]
            },
            {
                headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
                timeout: 10000 // Таймаут 10 сек, чтобы не зависало
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Ошибка:", error.message || error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Запуск сервера
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
