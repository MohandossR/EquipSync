import { useState } from "react";
import { apiService } from "../services/api";

export default function Assistant() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Hi! I'm EquipSync AI. Ask me about technicians, SLA risks, requests or inventory."
        }
    ]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        const userMessage = message;

        setMessages(prev => [
            ...prev,
            { role: "user", text: userMessage }
        ]);

        setMessage("");
        setLoading(true);

        try {
            const result = await apiService.assistantChat(userMessage);

            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    text: result.reply
                }
            ]);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    text: "Unable to process that request."
                }
            ]);
        }

        setLoading(false);
    };

    return (
        <div style={{
            maxWidth: 900,
            margin: "30px auto",
            padding: 20
        }}>
            <h1>🤖 EquipSync AI Assistant</h1>

            <div style={{
                minHeight: 400,
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 20,
                marginBottom: 15
            }}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: 15,
                            textAlign: msg.role === "user"
                                ? "right"
                                : "left"
                        }}
                    >
                        <div style={{
                            display: "inline-block",
                            padding: "10px 14px",
                            borderRadius: 10,
                            background:
                                msg.role === "user"
                                    ? "#e8f0ff"
                                    : "#f3f3f3",
                            maxWidth: "80%",
                            whiteSpace: "pre-line"
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {loading && <p>🤖 Thinking...</p>}
            </div>

            <div style={{
                display: "flex",
                gap: 10
            }}>
                <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") sendMessage();
                    }}
                    placeholder="Ask EquipSync AI..."
                    style={{
                        flex: 1,
                        padding: 12,
                        borderRadius: 8,
                        border: "1px solid #ccc"
                    }}
                />

                <button onClick={sendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
}