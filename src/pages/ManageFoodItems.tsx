import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FoodItem, getFoodItemsForEvent, createFoodItem, deleteFoodItem } from '../services/foodItemService';
import { authService } from '../services/authService';

interface FoodItemForm {
  name: string;
  price: number;
  description: string;
}

const ManageFoodItems: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [form, setForm] = useState<FoodItemForm>({
    name: '',
    price: 0,
    description: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchFoodItems = async () => {
    try {
      if (!eventId) return;
      const items = await getFoodItemsForEvent(parseInt(eventId));
      setFoodItems(items);
    } catch (err) {
      toast.error('Failed to load food items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Check if eventId exists
    if (!eventId) {
      navigate('/organizer/dashboard');
      return;
    }

    fetchFoodItems();
  }, [eventId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) {
      toast.error('Event ID is missing');
      return;
    }

    if (!form.name.trim()) {
      toast.error('Please enter a name for the food item');
      return;
    }

    if (form.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      await createFoodItem({
        name: form.name.trim(),
        price: form.price,
        description: form.description.trim(),
        eventId: parseInt(eventId)
      });
      setForm({ name: '', price: 0, description: '' });
      toast.success('Food item added successfully');
      fetchFoodItems();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add food item';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFoodItem(id);
      toast.success('Food item deleted successfully');
      fetchFoodItems();
    } catch (err) {
      toast.error('Failed to delete food item');
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Manage Food Items</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded border p-2"
                placeholder="Enter food item name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full rounded border p-2"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded border p-2 h-24"
                placeholder="Enter food item description"
              />
            </div>
            
            <button 
              type="submit" 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
            >
              Add Food Item
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-4">
        {foodItems.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">No food items added yet.</p>
          </div>
        ) : (
          foodItems.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-800 transition duration-200"
                title="Delete food item"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageFoodItems;
