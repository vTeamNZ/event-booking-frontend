import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Ticket, Users } from 'lucide-react';
import { 
  GeneralTicketSelection, 
  TicketType,
  PricingResponse 
} from '../types/seatSelection';
import { seatSelectionService } from '../services/seatSelectionService';
import { formatPrice } from '../utils/seatSelection';
import { cn } from '../utils/seatSelection';

interface GeneralAdmissionTicketsProps {
  eventId: number;
  onTicketChange: (selections: GeneralTicketSelection[]) => void;
}

const GeneralAdmissionTickets: React.FC<GeneralAdmissionTicketsProps> = ({
  eventId,
  onTicketChange
}) => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selections, setSelections] = useState<GeneralTicketSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ticket types
  useEffect(() => {
    const loadTicketTypes = async () => {
      try {
        setLoading(true);
        const pricing = await seatSelectionService.getEventPricing(eventId);
        setTicketTypes(pricing.ticketTypes);
        
        // Initialize selections with 0 quantity for each ticket type
        const initialSelections = pricing.ticketTypes.map(ticketType => ({
          ticketType,
          quantity: 0
        }));
        setSelections(initialSelections);
      } catch (err) {
        console.error('Failed to load ticket types:', err);
        setError('Failed to load ticket information');
      } finally {
        setLoading(false);
      }
    };

    loadTicketTypes();
  }, [eventId]);

  // Notify parent when selections change
  useEffect(() => {
    const activeSelections = selections.filter(s => s.quantity > 0);
    onTicketChange(activeSelections);
  }, [selections, onTicketChange]);

  const updateQuantity = (ticketTypeId: number, newQuantity: number) => {
    setSelections(prev => 
      prev.map(selection => 
        selection.ticketType.id === ticketTypeId
          ? { ...selection, quantity: Math.max(0, newQuantity) }
          : selection
      )
    );
  };

  const getTotalPrice = () => {
    return selections.reduce((total, selection) => 
      total + (selection.ticketType.price * selection.quantity), 0
    );
  };

  const getTotalTickets = () => {
    return selections.reduce((total, selection) => total + selection.quantity, 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Select Tickets
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Ticket size={16} />
          <span>General Admission - No seat assignment</span>
        </div>
      </div>

      <div className="space-y-4">
        {ticketTypes.map(ticketType => {
          const selection = selections.find(s => s.ticketType.id === ticketType.id);
          const quantity = selection?.quantity || 0;
          
          return (
            <motion.div
              key={ticketType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'border rounded-lg p-4 transition-all duration-200',
                quantity > 0 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{ticketType.name}</h4>
                  {ticketType.description && (
                    <p className="text-sm text-gray-600 mt-1">{ticketType.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(ticketType.price)}
                  </div>
                  <div className="text-xs text-gray-500">per ticket</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(ticketType.id, quantity - 1)}
                    disabled={quantity === 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  
                  <div className="w-12 text-center">
                    <span className="text-lg font-semibold">{quantity}</span>
                  </div>
                  
                  <button
                    onClick={() => updateQuantity(ticketType.id, quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {quantity > 0 && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {formatPrice(ticketType.price * quantity)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {quantity} ticket{quantity !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {getTotalTickets() > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg border"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-600" />
              <span className="font-medium text-gray-900">
                Total: {getTotalTickets()} ticket{getTotalTickets() !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900">
              {formatPrice(getTotalPrice())}
            </div>
          </div>
        </motion.div>
      )}

      {/* Help text */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-700">
          <strong>General Admission:</strong> Your tickets provide entry to the event. 
          Seating is first-come, first-served basis.
        </div>
      </div>
    </div>
  );
};

export default GeneralAdmissionTickets;
