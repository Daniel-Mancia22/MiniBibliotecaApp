import { firestoreService } from './firestoreService';

export const chatService = {
    sendMessage: async (message, chatHistory = []) => {
        try {
            // Guardar mensaje del usuario
            await firestoreService.saveChatMessage(message, true);

            // Simular respuesta de IA (reemplazar con API real de Groq)
            const aiResponse = await generateAIResponse(message, chatHistory);

            // Guardar respuesta de IA
            await firestoreService.saveChatMessage(aiResponse, false);

            return aiResponse;
        } catch (error) {
            throw error;
        }
    }
};

const generateAIResponse = async (message, chatHistory) => {
    // Simulación de respuesta de IA - integrar con Groq API
    const responses = [
        "Te recomiendo 'Cien años de soledad' de Gabriel García Márquez, una obra maestra del realismo mágico.",
        "Si te gusta la ciencia ficción, prueba con 'Fundación' de Isaac Asimov.",
        "Para thriller psicológico, 'El silencio de los corderos' es excelente.",
        "¿Has considerado leer '1984' de George Orwell? Es muy relevante hoy en día.",
        "Te sugiero 'El amor en los tiempos del cólera', otra gran obra de García Márquez."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
};