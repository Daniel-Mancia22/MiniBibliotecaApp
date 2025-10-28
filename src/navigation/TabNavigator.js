import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookDetailScreen from '../screens/BooksStack/BookDetailScreen';
import BooksScreen from '../screens/BooksStack/BooksScreen';
import ChatScreen from '../screens/ChatScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PendingScreen from '../screens/PendingScreen';

const Tab = createBottomTabNavigator();
const BooksStack = createNativeStackNavigator();

const BooksStackNavigator = () => (
    <BooksStack.Navigator>
        <BooksStack.Screen
            name="BooksList"
            component={BooksScreen}
            options={{ title: 'Libros' }}
        />
        <BooksStack.Screen
            name="BookDetail"
            component={BookDetailScreen}
            options={{ title: 'Detalles' }}
        />
    </BooksStack.Navigator>
);

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Libros') iconName = focused ? 'library' : 'library-outline';
                    else if (route.name === 'Favoritos') iconName = focused ? 'heart' : 'heart-outline';
                    else if (route.name === 'Pendientes') iconName = focused ? 'time' : 'time-outline';
                    else if (route.name === 'ChatBot') iconName = focused ? 'chatbubble' : 'chatbubble-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Libros" component={BooksStackNavigator} />
            <Tab.Screen name="Favoritos" component={FavoritesScreen} />
            <Tab.Screen name="Pendientes" component={PendingScreen} />
            <Tab.Screen name="ChatBot" component={ChatScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;