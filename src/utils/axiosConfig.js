import axios from 'axios';
// import { BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { BASE_URL } from './config';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// Set default headers
// axiosInstance.defaults.headers.common['Content-Type'] = 'multipart/form-data';


// Add a request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        // Retrieve token from cookies
        const token = await AsyncStorage.getItem('token'); // Replace 'token' with the correct key if necessary
        // console.warn('token----->>>',token);
        

        if (token) {
            // Attach token to the Authorization header
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // console.log('Response=', response?.data)
        return response;
    },
    (error) => {
        console.log('Response=', error)
        if (error.response) {
            if (error.response.status === 401) {

            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;