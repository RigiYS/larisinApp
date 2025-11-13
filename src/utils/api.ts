import axios from 'axios';

const PRODUCTS_URL = 'https://690eea50bd0fefc30a0607e8.mockapi.io/products';
const TRANSACTIONS_URL = 'https://691159ac7686c0e9c20d1ec7.mockapi.io/transactions';

export const getProducts = () => axios.get(PRODUCTS_URL);
export const addProduct = (data: any) => axios.post(PRODUCTS_URL, data);
export const updateProduct = (id: string, data: any) => axios.put(`${PRODUCTS_URL}/${id}`, data);
export const deleteProduct = (id: string) => axios.delete(`${PRODUCTS_URL}/${id}`);

export const getTransactions = () => axios.get(TRANSACTIONS_URL);
export const addTransaction = (data: any) => axios.post(TRANSACTIONS_URL, data);
