import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Ticket, Users, AlertTriangle } from 'lucide-react';
import { 
  GeneralTicketSelection
} from '../types/seatSelection';
import { TicketType } from '../types/ticketTypes';
import { getTicketTypesForEvent } from '../services/ticketTypeService';
import { ticketAvailabilityService, TicketAvailabilityInfo } from '../services/ticketAvailabilityService';
import { formatPrice } from '../utils/seatSelection';
import { cn } from '../utils/seatSelection';

interface GeneralAdmissionTicketsProps {
  eventId: number;
  onTicketChange: (selections: GeneralTicketSelection[]) => void;
  standingOnly?: boolean; // New prop to filter for standing tickets only
  embedded?: boolean; // New prop to render without outer container
  clearSelections?: boolean; // New prop to trigger clearing selections
}

const GeneralAdmissionTickets: React.FC<GeneralAdmissionTicketsProps> = ({
  eventId,
  onTicketChange,
  standingOnly = false,
  embedded = false,
  clearSelections = false
}) => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selections, setSelections] = useState<GeneralTicketSelection[]>([]);
  const [availability, setAvailability] = useState<Record<number, TicketAvailabilityInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ticket types and availability
  useEffect(() => {
    const loadTicketTypes = async () => {
      try {
        setLoading(true);
        
        // Load ticket types using the proper service
        const fetchedTicketTypes = await getTicketTypesForEvent(eventId);
        console.log('[GeneralAdmissionTickets] Fetched ticket types:', fetchedTicketTypes);
        console.log('[GeneralAdmissionTickets] standingOnly mode:', standingOnly);
        
        // Filter for standing tickets only if in hybrid mode
        const filteredTicketTypes = standingOnly 
          ? fetchedTicketTypes.filter((tt: any) => {
              console.log(`[GeneralAdmissionTickets] Checking ticket ${tt.name}: isStanding=${tt.isStanding}`);
              return tt.isStanding === true;
            })
          : fetchedTicketTypes;
        
        console.log('[GeneralAdmissionTickets] Filtered ticket types:', filteredTicketTypes);
        setTicketTypes(filteredTicketTypes);
        
        // Load ticket availability
        const availabilityData = await ticketAvailabilityService.getEventTicketAvailability(eventId);
        setAvailability(availabilityData);
        
        // Initialize selections with 0 quantity for each ticket type
        const initialSelections = filteredTicketTypes.map((ticketType: any) => ({
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
  }, [eventId, standingOnly]);

  // Notify parent when selections change
  useEffect(() => {
    const activeSelections = selections.filter(s => s.quantity > 0);
    onTicketChange(activeSelections);
  }, [selections, onTicketChange]);

  // Handle clearing selections when parent requests it
  useEffect(() => {
    if (clearSelections && ticketTypes.length > 0) {
      // Reset all selections to 0 quantity
      const clearedSelections = ticketTypes.map(ticketType => ({
        ticketType,
        quantity: 0
      }));
      setSelections(clearedSelections);
    }
  }, [clearSelections, ticketTypes]);

  const updateQuantity = (ticketTypeId: number, newQuantity: number) => {
    // Get availability info for this ticket type
    const availabilityInfo = availability[ticketTypeId];
    
    // Calculate maximum allowed quantity
    let maxAllowed = newQuantity;
    if (availabilityInfo && availabilityInfo.hasLimit) {
      maxAllowed = Math.min(newQuantity, availabilityInfo.available);
    }
    
    setSelections(prev => 
      prev.map(selection => 
        selection.ticketType.id === ticketTypeId
          ? { ...selection, quantity: Math.max(0, maxAllowed) }
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
      {ticketTypes.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <AlertTriangle size={48} className="mx-auto" />
          </div>
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            {standingOnly ? 'No Standing Tickets Available' : 'No Tickets Available'}
          </h4>
          <p className="text-gray-500">
            {standingOnly 
              ? 'This event does not offer standing room tickets.' 
              : 'No tickets are available for this event at this time.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {ticketTypes.map(ticketType => {
              const selection = selections.find(s => s.ticketType.id === ticketType.id);
              const quantity = selection?.quantity || 0;
              const availabilityInfo = availability[ticketType.id];
              const isSoldOut = availabilityInfo?.hasLimit && availabilityInfo.available === 0;
              const canIncrease = !availabilityInfo?.hasLimit || quantity < availabilityInfo.available;
          
          return (
            <motion.div
              key={ticketType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'border rounded-lg p-4 transition-all duration-200',
                isSoldOut ? 'border-red-200 bg-red-50 opacity-75' :
                quantity > 0 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className={cn(
                    "font-semibold",
                    isSoldOut ? "text-red-700" : "text-gray-900"
                  )}>
                    {ticketType.type}
                    {isSoldOut && <span className="ml-2 text-red-600 text-sm">(SOLD OUT)</span>}
                  </h4>
                  {/* Availability indicator */}
                  {availabilityInfo && availabilityInfo.hasLimit && (
                    <p className={cn(
                      "text-xs mt-1 font-medium",
                      isSoldOut ? "text-red-600" : 
                      availabilityInfo.available <= 5 ? "text-orange-600" : "text-green-600"
                    )}>
                      {isSoldOut ? "Sold Out" : `${availabilityInfo.available} tickets available`}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-lg font-bold",
                    isSoldOut ? "text-red-700" : "text-gray-900"
                  )}>
                    {formatPrice(ticketType.price)}
                  </div>
                  <div className="text-xs text-gray-500">per ticket</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(ticketType.id, quantity - 1)}
                    disabled={quantity === 0 || isSoldOut}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  
                  <div className="w-12 text-center">
                    <span className="text-lg font-semibold">{quantity}</span>
                  </div>
                  
                  <button
                    onClick={() => updateQuantity(ticketType.id, quantity + 1)}
                    disabled={isSoldOut || !canIncrease}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        </>
      )}
    </div>
  );
};

export default GeneralAdmissionTickets;
