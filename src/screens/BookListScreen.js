import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { firestoreService } from '../services/firestoreService';
import { storageService } from '../services/storageService';

const BookListScreen = ({ navigation }) => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            const booksData = await firestoreService.getBooks();
            setBooks(booksData);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los libros');
        }
    };

    const handleProfilePress = async () => {
        try {
            const userId = await storageService.getUserId();
            if (userId) {
                const user = await firestoreService.getUserById(userId);
                Alert.alert('Perfil del Usuario',
                    `Nombre: ${user.name}\nEmail: ${user.email}\nID: ${userId}`);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar la información del usuario');
        }
    };

    const renderBookItem = ({ item }) => (
        <TouchableOpacity
            style={styles.bookItem}
            onPress={() => navigation.navigate('BookDetail', { book: item })}
        >
            <Image source={{ uri: item.miniatura }} style={styles.bookImage} />
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{item.titulo}</Text>
                <Text style={styles.bookAuthor}>- {item.autor}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Libros</Text>
                <TouchableOpacity onPress={handleProfilePress}>
                    <Ionicons name="person-circle" size={32} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={books}
                renderItem={renderBookItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold'
    },

    bookItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },

    bookImage: {
        width: 60,
        height: 80,
        borderRadius: 5
    },

    bookInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center'
    },

    bookTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5
    },

    bookAuthor: {
        fontSize: 14,
        color: '#666'
    }
});

export default BookListScreen;