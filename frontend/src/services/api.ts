// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API Service
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication
  async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  }

  async register(userData: any) {
    return this.post('/auth/register', userData);
  }

  // Users
  async getUsers() {
    return this.get('/users');
  }

  // Events
  async getEvents() {
    return this.get('/events');
  }

  async getEvent(id: number) {
    return this.get(`/events/${id}`);
  }

  async createEvent(eventData: any) {
    return this.post('/events', eventData);
  }

  async updateEvent(id: number, eventData: any) {
    return this.put(`/events/${id}`, eventData);
  }

  async deleteEvent(id: number) {
    return this.delete(`/events/${id}`);
  }

  // Products
  async getProducts() {
    return this.get('/products');
  }

  async getProduct(id: number) {
    return this.get(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.post('/products', productData);
  }

  async updateProduct(id: number, productData: any) {
    return this.put(`/products/${id}`, productData);
  }

  async deleteProduct(id: number) {
    return this.delete(`/products/${id}`);
  }

  // Flowers
  async getFlowers() {
    return this.get('/flowers');
  }

  async getFlower(id: number) {
    return this.get(`/flowers/${id}`);
  }

  async createFlower(flowerData: any) {
    return this.post('/flowers', flowerData);
  }

  async updateFlower(id: number, flowerData: any) {
    return this.put(`/flowers/${id}`, flowerData);
  }

  async deleteFlower(id: number) {
    return this.delete(`/flowers/${id}`);
  }

  // Employees
  async getEmployees() {
    return this.get('/employees');
  }

  // Contacts
  async getContacts() {
    return this.get('/contacts');
  }

  // Cars
  async getCars() {
    return this.get('/cars');
  }

  // Rentals
  async getRentals() {
    return this.get('/rentals');
  }

  // Cost Types
  async getCostTypes() {
    return this.get('/cost-types');
  }

  // Containers
  async getContainers() {
    return this.get('/containers');
  }

  // Costs
  async getCosts() {
    return this.get('/costs');
  }

  // Chat
  async getChatMessages() {
    return this.get('/chat');
  }

  async sendMessage(messageData: any) {
    return this.post('/chat', messageData);
  }

  // Notifications
  async getNotifications() {
    return this.get('/notifications');
  }

  // Status Updates
  async getStatusUpdates() {
    return this.get('/status-updates');
  }
}

// Create and export API instance
const api = new ApiService();
export default api; 