import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebase';

const FavoritesScreen = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = () => {
        try {
            const favoritesRef = collection(db, 'Daniel_Mancia-favoritos');

            const unsubscribe = onSnapshot(favoritesRef, (snapshot) => {
                const favoritesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log('❤️ Favoritos cargados:', favoritesData.length);
                setFavorites(favoritesData);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error loading favorites:', error);
            Alert.alert('Error', 'No se pudieron cargar los favoritos');
        }
    };

    const deleteFavorite = async (bookId, bookTitle) => {
        Alert.alert(
            'Eliminar de favoritos',
            `¿Estás seguro de eliminar "${bookTitle}" de tus favoritos?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ Eliminando favorito con ID:', bookId);
                            await deleteDoc(doc(db, 'Daniel_Mancia-favoritos', bookId));
                            Alert.alert('✅ Eliminado', 'Libro removido de favoritos');
                        } catch (error) {
                            console.error('❌ Error eliminando favorito:', error);
                            Alert.alert('❌ Error', 'No se pudo eliminar el libro: ' + error.message);
                        }
                    }
                }
            ]
        );
    };

    const rateBook = async (bookId, bookTitle) => {
        Alert.alert(
            'Valorar libro',
            `¿Quieres valorar "${bookTitle}" con 5 estrellas y marcarlo como recomendado?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Valorar',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            console.log('⭐ Valorando libro con ID:', bookId);
                            await updateDoc(doc(db, 'Daniel_Mancia-favoritos', bookId), {
                                recomendado: true,
                                rating: 5,
                                ratedAt: new Date()
                            });
                            Alert.alert('✅ Valorado', 'Libro marcado como recomendado');
                        } catch (error) {
                            console.error('❌ Error valorando libro:', error);
                            Alert.alert('❌ Error', 'No se pudo valorar el libro: ' + error.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderFavoriteItem = ({ item }) => (
        <View style={styles.favoriteItem}>
            <Image
                source={{ uri: item.thumbnail }}
                style={styles.thumbnail}
            />
            <View style={styles.bookInfo}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.author}>{item.author}</Text>
                {item.recomendado && (
                    <Text style={styles.recommended}>⭐ Recomendado</Text>
                )}
            </View>
            <View style={styles.actions}>
                {!item.recomendado && (
                    <TouchableOpacity
                        style={[styles.rateButton, loading && styles.disabledButton]}
                        onPress={() => rateBook(item.id, item.title)}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>⭐ Valorar</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.deleteButton, loading && styles.disabledButton]}
                    onPress={() => deleteFavorite(item.id, item.title)}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>🗑️ Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyTitle}>No hay favoritos</Text>
            <Text style={styles.emptyText}>
                Los libros que agregues a favoritos aparecerán aquí
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>❤️ Mis Favoritos</Text>
                <Text style={styles.headerSubtitle}>
                    {favorites.length} libro{favorites.length !== 1 ? 's' : ''} favorito{favorites.length !== 1 ? 's' : ''}
                </Text>
            </View>

            <FlatList
                data={favorites}
                renderItem={renderFavoriteItem}
                keyExtractor={item => item.id || Math.random().toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={favorites.length === 0 && styles.emptyList}
                ListEmptyComponent={renderEmptyState}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },

    header: {
        backgroundColor: 'white',
        padding: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },

    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },

    headerSubtitle: {
        fontSize: 14,
        color: '#666',
    },

    favoriteItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 15,
        marginHorizontal: 15,
        marginBottom: 10,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    thumbnail: {
        width: 50,
        height: 70,
        borderRadius: 5,
        marginRight: 15,
        backgroundColor: '#f0f0f0',
    },

    bookInfo: {
        flex: 1,
    },

    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },

    author: {
        fontSize: 14,
        color: '#666',
    },

    recommended: {
        color: '#FF9500',
        fontWeight: 'bold',
        marginTop: 5,
        fontSize: 12,
    },

    actions: {
        gap: 8,
    },

    rateButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#FF9500',
        borderRadius: 8,
        alignItems: 'center',
    },

    deleteButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#dc3545',
        borderRadius: 8,
        alignItems: 'center',
    },

    disabledButton: {
        backgroundColor: '#6c757d',
        opacity: 0.6,
    },

    buttonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },

    emptyList: {
        flex: 1,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 10,
    },

    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default FavoritesScreen;