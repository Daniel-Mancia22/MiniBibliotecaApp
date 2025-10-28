import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    FlatList, KeyboardAvoidingView, Platform, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { db } from '../config/firebase';
import.meta.env.VITE_API_KEY_TOKEN;
import.meta.env.VITE_API_KEY_GROUP;

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    useEffect(() => {
        loadChatHistory();
    }, []);

    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const loadChatHistory = async () => {
        try {
            const chatRef = collection(db, 'chat_Daniel_Mancia');
            const q = query(chatRef, orderBy('timestamp', 'asc'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const chatData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(chatData);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setLoading(true);

        try {
            // Guardar mensaje del usuario
            await addDoc(collection(db, 'chat_Daniel_Mancia'), {
                role: 'user',
                content: userMessage,
                timestamp: new Date()
            });

            // Obtener historial para contexto
            const recentMessages = messages.slice(-6).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Llamar a la API de GROQ
            const aiResponse = await getAIResponse([
                ...recentMessages,
                { role: 'user', content: userMessage }
            ]);

            // Guardar respuesta de la IA
            await addDoc(collection(db, 'chat_Daniel_Mancia'), {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Error sending message:', error);

            // Guardar mensaje de error
            await addDoc(collection(db, 'chat_Daniel_Mancia'), {
                role: 'assistant',
                content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta nuevamente.',
                timestamp: new Date()
            });
        } finally {
            setLoading(false);
        }
    };

    const getAIResponse = async (messageHistory) => {
        const API_KEY = import.meta.env.VITE_API_KEY_TOKEN;
        const API_URL = VITE_API_KEY_GROUP;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: `Eres BookBot, un asistente especializado en recomendaciones de libros. 
                            Características:
                            - Responde siempre en español de manera amigable
                            - Recomienda libros específicos cuando sea posible
                            - Pregunta sobre gustos del usuario para mejores recomendaciones
                            - Sé entusiasta sobre la lectura
                            - Mantén respuestas claras y útiles
                            - Enfócate en géneros: misterio, romance, ciencia ficción, fantasía, thriller, drama
                            - Si no conoces un libro, sé honesto pero sugerente`
                        },
                        ...messageHistory
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                    top_p: 0.9
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                throw new Error('Respuesta inesperada de la API');
            }

        } catch (error) {
            console.error('Error calling GROQ API:', error);
            return "¡Hola! Soy BookBot, tu asistente de recomendaciones literarias. Actualmente estoy teniendo problemas de conexión, pero puedes contarme qué tipo de libros te gustan y cuando me recupere te daré excelentes recomendaciones. ¿Qué género te interesa? 📚";
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderMessage = ({ item, index }) => {
        const isUser = item.role === 'user';
        const showAvatar = index === 0 || messages[index - 1]?.role !== item.role;

        return (
            <View style={[
                styles.messageRow,
                isUser ? styles.userRow : styles.aiRow
            ]}>
                {!isUser && showAvatar && (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>🤖</Text>
                    </View>
                )}

                <View style={[
                    styles.messageContainer,
                    isUser ? styles.userMessage : styles.aiMessage,
                    !showAvatar && (isUser ? styles.userMessageContinued : styles.aiMessageContinued)
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.userMessageText : styles.aiMessageText
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.timestamp,
                        isUser ? styles.userTimestamp : styles.aiTimestamp
                    ]}>
                        {formatTime(item.timestamp)}
                    </Text>
                </View>

                {isUser && showAvatar && (
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>👤</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🤖</Text>
            <Text style={styles.emptyTitle}>BookBot Assistant</Text>
            <Text style={styles.emptyText}>
                ¡Hola! Soy tu asistente de recomendaciones de libros.
                Puedes preguntarme sobre libros, autores o géneros que te interesen.
            </Text>
            <View style={styles.suggestions}>
                <Text style={styles.suggestionsTitle}>Puedes preguntarme:</Text>
                <Text style={styles.suggestion}>• "Recomiéndame un libro de misterio"</Text>
                <Text style={styles.suggestion}>• "¿Qué libro de romance me sugieres?"</Text>
                <Text style={styles.suggestion}>• "Autores similares a Stephen King"</Text>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🤖 BookBot Assistant</Text>
                <Text style={styles.headerSubtitle}>
                    Especialista en recomendaciones de libros
                </Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                style={styles.messagesList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={messages.length === 0 && styles.emptyList}
                ListEmptyComponent={renderEmptyState}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Escribe tu mensaje aquí..."
                    placeholderTextColor="#999"
                    multiline
                    maxLength={500}
                    editable={!loading}
                />
                <TouchableOpacity
                    style={[styles.sendButton, (loading || !input.trim()) && styles.disabledButton]}
                    onPress={sendMessage}
                    disabled={loading || !input.trim()}
                >
                    <Text style={styles.sendButtonText}>
                        {loading ? '⏳' : '📤'}
                    </Text>
                </TouchableOpacity>
            </View>

            {loading && (
                <View style={styles.typingIndicator}>
                    <Text style={styles.typingText}>BookBot está escribiendo...</Text>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },

    header: {
        backgroundColor: 'white',
        padding: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },

    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },

    messagesList: {
        flex: 1,
    },

    emptyList: {
        flex: 1,
    },

    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: 2,
        paddingHorizontal: 15,
    },

    userRow: {
        justifyContent: 'flex-end',
    },

    aiRow: {
        justifyContent: 'flex-start',
    },

    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },

    avatarText: {
        fontSize: 16,
    },

    messageContainer: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 18,
        marginVertical: 2,
    },

    userMessage: {
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 4,
    },

    userMessageContinued: {
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 4,
        marginLeft: 48,
    },

    aiMessage: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },

    aiMessageContinued: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginLeft: 48,
    },

    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },

    userMessageText: {
        color: 'white',
    },

    aiMessageText: {
        color: '#333',
    },

    timestamp: {
        fontSize: 10,
        marginTop: 4,
        opacity: 0.7,
    },

    userTimestamp: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
    },

    aiTimestamp: {
        color: '#666',
    },

    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },

    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 25,
        paddingHorizontal: 18,
        paddingVertical: 12,
        marginRight: 10,
        maxHeight: 100,
        fontSize: 16,
        backgroundColor: '#f8f9fa',
    },

    sendButton: {
        backgroundColor: '#007AFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },

    disabledButton: {
        backgroundColor: '#ccc',
    },

    sendButtonText: {
        color: 'white',
        fontSize: 18,
    },

    typingIndicator: {
        backgroundColor: 'white',
        padding: 10,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },

    typingText: {
        color: '#666',
        fontSize: 12,
        fontStyle: 'italic',
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        flex: 1,
    },

    emptyIcon: {
        fontSize: 60,
        marginBottom: 20,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },

    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },

    suggestions: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        width: '100%',
    },

    suggestionsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },

    suggestion: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        lineHeight: 16,
    },
});

export default ChatScreen;