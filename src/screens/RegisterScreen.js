import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebase';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
        } else if (name.trim().length < 2) {
            newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = 'El email es obligatorio';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Ingresa un email válido';
        }

        if (!password) {
            newErrors.password = 'La contraseña es obligatoria';
        } else if (password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const checkEmailExists = async (email) => {
        try {
            const q = query(collection(db, 'user-register'), where('email', '==', email.toLowerCase()));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error('Error verificando email:', error);
            return false;
        }
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const emailExists = await checkEmailExists(email);
            if (emailExists) {
                setErrors({ email: 'Este email ya está registrado' });
                setLoading(false);
                return;
            }

            console.log('🔸 Registrando nuevo usuario...');

            const docRef = await addDoc(collection(db, 'user-register'), {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: password,
                createdAt: new Date()
            });

            console.log('✅ Usuario registrado con ID:', docRef.id);

            await AsyncStorage.setItem('userUID', docRef.id);
            console.log('✅ userUID guardado en AsyncStorage');

            Alert.alert(
                '¡Registro Exitoso!',
                `Bienvenido ${name.trim()} a tu biblioteca digital`,
                [
                    {
                        text: 'Comenzar',
                        onPress: () => {
                            navigation.replace('MainTabs');
                        }
                    }
                ]
            );

        } catch (error) {
            console.error('❌ Error en registro:', error);
            Alert.alert('Error', 'No se pudo completar el registro. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📚 Biblioteca Digital</Text>
                <Text style={styles.subtitle}>Daniel Mancia</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Crear Cuenta</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, errors.name && styles.inputError]}
                        placeholder="Nombre completo"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                        editable={!loading}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        placeholder="correo@gmail.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.passwordInput, errors.password && styles.inputError]}
                            placeholder="Contraseña"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: '' });
                            }}
                            secureTextEntry={!showPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                            placeholder="Confirmar contraseña"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                            }}
                            secureTextEntry={!showConfirmPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Ionicons
                                name={showConfirmPassword ? "eye-off" : "eye"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.disabledButton]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? '🔄 Creando cuenta...' : '📝 Registrarse'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.footerText}>
                    Al registrarte, aceptas nuestros términos y condiciones
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },

    header: {
        backgroundColor: '#007AFF',
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        alignItems: 'center',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },

    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },

    formContainer: {
        flex: 1,
        padding: 25,
        paddingTop: 40,
    },

    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },

    inputContainer: {
        marginBottom: 20,
    },

    input: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
        fontSize: 16,
        color: '#333',
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },

    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: '#333',
    },

    eyeButton: {
        padding: 16,
    },

    inputError: {
        borderColor: '#dc3545',
        backgroundColor: '#fff5f5',
    },

    errorText: {
        color: '#dc3545',
        fontSize: 14,
        marginTop: 5,
        marginLeft: 5,
    },

    button: {
        backgroundColor: '#007AFF',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },

    disabledButton: {
        backgroundColor: '#6c757d',
        shadowOpacity: 0,
    },

    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },

    footerText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#6c757d',
        fontSize: 12,
    },
});

export default RegisterScreen;