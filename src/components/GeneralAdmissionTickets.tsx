import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Ticket, Users, AlertTriangle, Ban } from 'lucide-react';
import { 
  GeneralTicketSelection
} from '../types/seatSelection';
import { TicketTypeWithState } from '../types/ticketTypes';
import { getVisibleTicketTypesForCustomers } from '../services/ticketTypeService';
import { ticketAvailabilityService, TicketAvailabilityInfo } from '../services/ticketAvailabilityService';
import { formatPrice } from '../utils/seatSelection';
import { cn } from '../utils/seatSelection';
import { getAvailabilityStatus } from '../utils/availabilityStatus';
import { getTicketStatus, getTicketStatusMessage } from '../types/ticketTypes';

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
  const [ticketTypes, setTicketTypes] = useState<TicketTypeWithState[]>([]);
  const [selections, setSelections] = useState<GeneralTicketSelection[]>([]);
  const [availability, setAvailability] = useState<Record<number, TicketAvailabilityInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ticket types and availability
  useEffect(() => {
    const loadTicketTypes = async () => {
      try {
        setLoading(true);
        
        // Load visible ticket types using the new state-aware service
        const fetchedTicketTypes = await getVisibleTicketTypesForCustomers(eventId);
        console.log('[GeneralAdmissionTickets] Fetched ticket types with state:', fetchedTicketTypes);
        console.log('[GeneralAdmissionTickets] standingOnly mode:', standingOnly);
        
        // Filter for standing tickets only if in hybrid mode
        const filteredTicketTypes = standingOnly 
          ? fetchedTicketTypes.filter((tt) => {
              console.log(`[GeneralAdmissionTickets] Checking ticket ${tt.name}: isStanding=${tt.isStanding}`);
              return tt.isStanding === true;
            })
          : fetchedTicketTypes;
        
        console.log('[GeneralAdmissionTickets] Filtered ticket types:', filteredTicketTypes);
        setTicketTypes(filteredTicketTypes);
        
        // Load ticket availability
        const availabilityData = await ticketAvailabilityService.getEventTicketAvailability(eventId);
        setAvailability(availabilityData);
        
        // Initialize selections with 0 quantity for each ticket type (only for available tickets)
        const initialSelections = filteredTicketTypes.map((ticketType) => ({
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
              
              // Check ticket state
              const ticketStatus = getTicketStatus(ticketType);
              const isDisabled = ticketStatus === 'disabled';
              const isAvailable = ticketStatus === 'available';
              const statusMessage = getTicketStatusMessage(ticketType);
              
              // Check sold out status
              const isSoldOut = availabilityInfo?.hasLimit && availabilityInfo.available === 0;
              const canIncrease = isAvailable && (!availabilityInfo?.hasLimit || quantity < availabilityInfo.available);
              
              // Determine if user can interact with this ticket
              const canPurchase = isAvailable && !isSoldOut;
          
          return (
            <motion.div
              key={ticketType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'border rounded-lg p-4 transition-all duration-200',
                isDisabled ? 'border-orange-200 bg-orange-50' :
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
                    isDisabled ? "text-orange-700" :
                    isSoldOut ? "text-red-700" : "text-gray-900"
                  )}>
                    {ticketType.type}
                    {isSoldOut && <span className="ml-2 text-red-600 text-sm">(SOLD OUT)</span>}
                    {isDisabled && <span className="ml-2 text-orange-600 text-sm">(NO LONGER AVAILABLE)</span>}
                  </h4>
                  
                  {/* Show status message for disabled tickets */}
                  {statusMessage && (
                    <div className="flex items-center gap-1 mt-1">
                      <Ban size={14} className="text-orange-600" />
                      <p className="text-sm text-orange-700 font-medium">
                        {statusMessage}
                      </p>
                    </div>
                  )}
                  
                  {/* Enhanced availability indicator using percentage-based status */}
                  {availabilityInfo && isAvailable && (
                    (() => {
                      const availabilityStatus = getAvailabilityStatus(
                        availabilityInfo.available,
                        availabilityInfo.sold,
                        availabilityInfo.hasLimit,
                        false // not a table
                      );
                      
                      return (
                        <p className={cn(
                          "text-xs mt-1 font-medium",
                          availabilityStatus.colorClass
                        )}>
                          {availabilityStatus.statusText}
                        </p>
                      );
                    })()
                  )}
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-lg font-bold",
                    isDisabled ? "text-orange-700 line-through" :
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
                    disabled={quantity === 0 || !canPurchase}
                    className={cn(
                      "w-8 h-8 rounded-full border flex items-center justify-center transition-colors",
                      canPurchase && quantity > 0
                        ? "border-gray-300 hover:bg-gray-50"
                        : "border-gray-200 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Minus size={16} />
                  </button>
                  
                  <div className="w-12 text-center">
                    <span className="text-lg font-semibold">{quantity}</span>
                  </div>
                  
                  <button
                    onClick={() => updateQuantity(ticketType.id, quantity + 1)}
                    disabled={!canPurchase || !canIncrease}
                    className={cn(
                      "w-8 h-8 rounded-full border flex items-center justify-center transition-colors",
                      canPurchase && canIncrease
                        ? "border-gray-300 hover:bg-gray-50"
                        : "border-gray-200 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {quantity > 0 && canPurchase && (
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
