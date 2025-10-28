import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert, FlatList, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { db } from '../config/firebase';

const PendingScreen = () => {
    const [pendingBooks, setPendingBooks] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPendingBooks();
    }, []);

    const loadPendingBooks = () => {
        try {
            const pendingRef = collection(db, 'Daniel_Mancia-pendientes');

            const unsubscribe = onSnapshot(pendingRef, (snapshot) => {
                const pendingData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log('📚 Pendientes cargados:', pendingData.length);
                setPendingBooks(pendingData);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error cargando pendientes:', error);
            Alert.alert('Error', 'No se pudieron cargar los libros pendientes');
        }
    };

    const toggleStatus = async (bookId, currentStatus, bookTitle) => {
        if (loading) return;

        const newStatus = currentStatus === 'pendiente' ? 'leído' : 'pendiente';
        const action = newStatus === 'leído' ? 'marcar como leído' : 'marcar como pendiente';

        Alert.alert(
            'Cambiar estado',
            `¿Quieres ${action} "${bookTitle}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            console.log('🔄 Cambiando estado del libro:', bookId);
                            await updateDoc(doc(db, 'Daniel_Mancia-pendientes', bookId), {
                                estado: newStatus,
                                updatedAt: new Date()
                            });

                            const message = newStatus === 'leído'
                                ? '¡Libro marcado como leído! 📖✅'
                                : 'Libro marcado como pendiente ⏳';
                            Alert.alert('✅ Estado actualizado', message);
                        } catch (error) {
                            console.error('❌ Error cambiando estado:', error);
                            Alert.alert('❌ Error', 'No se pudo cambiar el estado: ' + error.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const deletePending = async (bookId, bookTitle) => {
        Alert.alert(
            'Eliminar libro',
            `¿Estás seguro de que quieres eliminar "${bookTitle}" de tu lista?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ Eliminando pendiente con ID:', bookId);
                            await deleteDoc(doc(db, 'Daniel_Mancia-pendientes', bookId));
                            Alert.alert('✅ Eliminado', 'Libro removido de la lista');
                        } catch (error) {
                            console.error('❌ Error eliminando pendiente:', error);
                            Alert.alert('❌ Error', 'No se pudo eliminar el libro: ' + error.message);
                        }
                    }
                }
            ]
        );
    };

    const getStats = () => {
        const total = pendingBooks.length;
        const read = pendingBooks.filter(book => book.estado === 'leído').length;
        const pending = total - read;

        return { total, read, pending };
    };

    const renderPendingItem = ({ item }) => (
        <View style={styles.pendingItem}>
            <View style={styles.bookInfo}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.author}>{item.author}</Text>

                <View style={styles.statusContainer}>
                    <View style={[
                        styles.statusBadge,
                        item.estado === 'leído' ? styles.readBadge : styles.pendingBadge
                    ]}>
                        <Text style={[
                            styles.statusText,
                            item.estado === 'leído' ? styles.readText : styles.pendingText
                        ]}>
                            {item.estado === 'leído' ? '✅ Leído' : '⏳ Pendiente'}
                        </Text>
                    </View>

                    <Text style={styles.date}>
                        {item.updatedAt
                            ? `Actualizado: ${item.updatedAt.toDate().toLocaleDateString()}`
                            : `Agregado: ${item.addedAt?.toDate().toLocaleDateString()}`
                        }
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        item.estado === 'leído' ? styles.pendingButton : styles.readButton,
                        loading && styles.disabledButton
                    ]}
                    onPress={() => toggleStatus(item.id, item.estado, item.title)}
                    disabled={loading}
                >
                    <Text style={styles.toggleButtonText}>
                        {item.estado === 'leído' ? '⏳' : '✅'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.deleteButton, loading && styles.disabledButton]}
                    onPress={() => deletePending(item.id, item.title)}
                    disabled={loading}
                >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⏳</Text>
            <Text style={styles.emptyTitle}>Lista de lectura vacía</Text>
            <Text style={styles.emptyText}>
                Los libros que guardes como pendientes aparecerán aquí
            </Text>
        </View>
    );

    const stats = getStats();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>⏳ Mi Lista de Lectura</Text>

                {pendingBooks.length > 0 && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, styles.readStat]}>{stats.read}</Text>
                            <Text style={styles.statLabel}>Leídos</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statNumber, styles.pendingStat]}>{stats.pending}</Text>
                            <Text style={styles.statLabel}>Pendientes</Text>
                        </View>
                    </View>
                )}
            </View>

            <FlatList
                data={pendingBooks}
                renderItem={renderPendingItem}
                keyExtractor={item => item.id || Math.random().toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={pendingBooks.length === 0 && styles.emptyList}
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
        marginBottom: 15,
    },

    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 12,
    },

    statItem: {
        alignItems: 'center',
    },

    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },

    readStat: {
        color: '#28a745',
    },

    pendingStat: {
        color: '#ffc107',
    },

    statLabel: {
        fontSize: 12,
        color: '#666',
    },

    pendingItem: {
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
        marginBottom: 8,
    },

    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    pendingBadge: {
        backgroundColor: '#fff3cd',
    },

    readBadge: {
        backgroundColor: '#d4edda',
    },

    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },

    pendingText: {
        color: '#856404',
    },

    readText: {
        color: '#155724',
    },

    date: {
        fontSize: 11,
        color: '#999',
    },

    actions: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 10,
    },

    toggleButton: {
        padding: 10,
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    readButton: {
        backgroundColor: '#28a745',
    },

    pendingButton: {
        backgroundColor: '#ffc107',
    },

    disabledButton: {
        backgroundColor: '#6c757d',
        opacity: 0.6,
    },

    toggleButtonText: {
        fontSize: 16,
        color: 'white',
    },

    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    deleteButtonText: {
        fontSize: 16,
        color: 'white',
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

export default PendingScreen;