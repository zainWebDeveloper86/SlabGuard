import axios from "axios";

const server = `${import.meta.env.VITE_SERVER_URL}/api`;

export const axiosServerInstance = axios.create({
  baseURL: server,
  withCredentials: true,
});

export const backend_url = `${import.meta.env.VITE_SERVER_URL}/`;