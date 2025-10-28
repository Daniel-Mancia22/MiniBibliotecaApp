import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebase';

const BookDetailScreen = ({ route, navigation }) => {
    const { book } = route.params;
    const [loading, setLoading] = useState(false);

    // Función para verificar duplicados
    const checkDuplicate = async (collectionName, bookTitle) => {
        try {
            console.log(`🔍 Verificando duplicado en ${collectionName}:`, bookTitle);
            const q = query(
                collection(db, collectionName),
                where('title', '==', bookTitle)
            );
            const querySnapshot = await getDocs(q);
            const exists = !querySnapshot.empty;
            console.log(`📊 ¿Existe duplicado? ${exists}`);
            return exists;
        } catch (error) {
            console.error('❌ Error verificando duplicado:', error);
            return false;
        }
    };

    const addToFavorites = async () => {
        if (loading) return;

        setLoading(true);
        try {
            // Verificar si ya existe en favoritos
            const isDuplicate = await checkDuplicate('Daniel_Mancia-favoritos', book.title);
            if (isDuplicate) {
                Alert.alert('⚠️ Aviso', 'Este libro ya está en tus favoritos');
                setLoading(false);
                return;
            }

            const userUID = await AsyncStorage.getItem('userUID');
            console.log('➕ Agregando a favoritos:', book.title);

            const docRef = await addDoc(collection(db, 'Daniel_Mancia-favoritos'), {
                title: book.title,
                author: book.author,
                description: book.description,
                thumbnail: book.thumbnail,
                userId: userUID,
                addedAt: new Date(),
                originalBookId: book.id,
                collectionType: 'favoritos'
            });

            console.log('✅ Favorito agregado con ID:', docRef.id);
            Alert.alert('✅ Éxito', 'Libro agregado a favoritos');

        } catch (error) {
            console.error('❌ Error agregando a favoritos:', error);
            Alert.alert('❌ Error', 'No se pudo agregar a favoritos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const addToPending = async () => {
        if (loading) return;

        setLoading(true);
        try {
            // Verificar si ya existe en pendientes
            const isDuplicate = await checkDuplicate('Daniel_Mancia-pendientes', book.title);
            if (isDuplicate) {
                Alert.alert('⚠️ Aviso', 'Este libro ya está en tus pendientes');
                setLoading(false);
                return;
            }

            const userUID = await AsyncStorage.getItem('userUID');
            console.log('➕ Agregando a pendientes:', book.title);

            const docRef = await addDoc(collection(db, 'Daniel_Mancia-pendientes'), {
                title: book.title,
                author: book.author,
                description: book.description,
                thumbnail: book.thumbnail,
                userId: userUID,
                estado: 'pendiente',
                addedAt: new Date(),
                originalBookId: book.id,
                collectionType: 'pendientes'
            });

            console.log('✅ Pendiente agregado con ID:', docRef.id);
            Alert.alert('✅ Éxito', 'Libro agregado a pendientes');

        } catch (error) {
            console.error('❌ Error agregando a pendientes:', error);
            Alert.alert('❌ Error', 'No se pudo agregar a pendientes: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: book.thumbnail }} style={styles.coverImage} />

            <View style={styles.content}>
                <Text style={styles.title}>{book.title}</Text>
                <Text style={styles.author}>{book.author}</Text>
                <Text style={styles.description}>{book.description}</Text>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={[styles.button, loading && styles.disabledButton]}
                        onPress={addToFavorites}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? '🔄 Agregando...' : '❤️ Agregar a favoritos'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton, loading && styles.disabledButton]}
                        onPress={addToPending}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? '🔄 Agregando...' : '⏳ Guardar como Pendiente'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },

    coverImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover'
    },

    content: {
        padding: 20
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center'
    },

    author: {
        fontSize: 18,
        color: 'gray',
        marginBottom: 20,
        textAlign: 'center',
        fontStyle: 'italic'
    },

    description: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 30,
        textAlign: 'justify'
    },

    buttonsContainer: {
        gap: 10
    },

    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center'
    },

    secondaryButton: {
        backgroundColor: '#34C759'
    },

    disabledButton: {
        backgroundColor: '#6c757d',
        opacity: 0.6
    },

    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default BookDetailScreen;