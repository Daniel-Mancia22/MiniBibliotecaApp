import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebase';

const BooksScreen = ({ navigation }) => {
    const [books, setBooks] = useState([]);
    const [userData, setUserData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadBooks();
        setupHeader();
    }, []);

    const setupHeader = () => {
        navigation.setOptions({
            headerTitle: '📚 Biblioteca Digital',
            headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 17,
                color: '#333',
            },
            headerRight: () => (
                <TouchableOpacity onPress={showUserProfile} style={styles.profileButton}>
                    <Ionicons name="person-circle" size={32} color="#007AFF" />
                </TouchableOpacity>
            )
        });
    };

    const showUserProfile = async () => {
        try {
            const userUID = await AsyncStorage.getItem('userUID');
            if (userUID) {
                const userDoc = await getDoc(doc(db, 'user-register', userUID));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    Alert.alert(
                        '👤 Tu Perfil',
                        `Nombre: ${userData.name}\nEmail: ${userData.email}`,
                        [{ text: 'OK', style: 'default' }]
                    );
                } else {
                    Alert.alert('Error', 'No se encontró la información del usuario');
                }
            } else {
                Alert.alert('Error', 'No hay usuario registrado');
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
            Alert.alert('Error', 'No se pudo cargar la información del perfil');
        }
    };

    const loadBooks = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'libros_demo'));
            const booksData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBooks(booksData);
        } catch (error) {
            console.error('Error cargando libros:', error);
            Alert.alert('Error', 'No se pudieron cargar los libros');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBooks();
        setRefreshing(false);
    };

    const renderBookItem = ({ item }) => (
        <TouchableOpacity
            style={styles.bookItem}
            onPress={() => navigation.navigate('BookDetail', { book: item })}
        >
            <Image
                source={{ uri: item.thumbnail }}
                style={styles.thumbnail}
            //defaultSource={require('../../assets/book-placeholder.png')} // Agrega una imagen placeholder
            />
            <View style={styles.bookInfo}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.author}>por {item.author}</Text>
                <Text style={styles.description} numberOfLines={2}>
                    {item.description || 'Descripción no disponible'}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No hay libros disponibles</Text>
            <Text style={styles.emptyStateText}>
                Los libros aparecerán aquí cuando estén disponibles
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                    📖 {books.length} libro{books.length !== 1 ? 's' : ''} disponible{books.length !== 1 ? 's' : ''}
                </Text>
            </View>

            <FlatList
                data={books}
                renderItem={renderBookItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007AFF']}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={books.length === 0 && styles.emptyList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },

    profileButton: {
        marginRight: 15,
        padding: 5,
    },

    statsContainer: {
        backgroundColor: 'white',
        padding: 15,
        margin: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    statsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },

    bookItem: {
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
        width: 60,
        height: 80,
        borderRadius: 8,
        marginRight: 15,
        backgroundColor: '#f0f0f0',
    },

    bookInfo: {
        flex: 1,
        justifyContent: 'center',
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
        marginBottom: 6,
    },

    description: {
        fontSize: 12,
        color: '#888',
        lineHeight: 16,
    },

    emptyList: {
        flex: 1,
        justifyContent: 'center',
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },

    emptyStateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 20,
        marginBottom: 10,
    },

    emptyStateText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default BooksScreen;