const cache = new Map();

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;

    // Проверяем кеш
    if (cache.has(userMessage)) {
        console.log("✅ Ответ из кеша");
        return res.json({ reply: cache.get(userMessage) });
    }

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }],
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const botReply = response.data.choices[0].message.content;
        console.log("Отправляю запрос к OpenAI:", req.body.message);
        cache.set(userMessage, botReply); // Кешируем ответ

        console.log("✅ Ответ от OpenAI:", botReply);
        res.json({ reply: botReply });
    } catch (error) {
        if (error.response?.status === 429) {
            console.error("❌ Превышен лимит запросов OpenAI, ждем 5 минут...");
            await new Promise(resolve => setTimeout(resolve, 300000)); // 5 минут паузы
            return res.status(429).json({ error: "Лимит запросов превышен. Попробуйте позже." });
        }
        console.error("❌ Ошибка при запросе к OpenAI:", error.response?.data || error.message);
        res.status(500).json({ error: "Ошибка сервера." });
    }
});
