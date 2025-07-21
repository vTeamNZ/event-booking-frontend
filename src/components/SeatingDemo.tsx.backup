// Demo component to test the new seating system
import React, { useEffect, useState } from 'react';
import { SeatingLayoutV2 } from './seating-v2';
import { SeatingSelectionState, SeatingLayoutResponse } from '../types/seating-v2';
import { seatingAPIService } from '../services/seating-v2/seatingAPIService';
import { toast } from 'react-hot-toast';

const SeatingDemo: React.FC = () => {
  const [layoutData, setLayoutData] = useState<SeatingLayoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEventLayout = async () => {
      try {
        setLoading(true);
        const response = await seatingAPIService.getEventSeatLayout(41);
        setLayoutData(response);
        console.log('Event layout data:', response);
      } catch (err: any) {
        console.error('Failed to load event layout:', err);
        setError(err.message || 'Failed to load event layout');
        toast.error('Failed to load event layout');
      } finally {
        setLoading(false);
      }
    };

    loadEventLayout();
  }, []);

  const handleSelectionComplete = (selectionState: SeatingSelectionState) => {
    console.log('Selection completed:', selectionState);
    alert(`Selected ${selectionState.selectedSeats.length} seats for a total of $${selectionState.totalPrice}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading event data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error loading event</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            New Seating System V2 - Event #41 Demo
          </h1>
          {layoutData && (
            <div className="text-gray-600 space-y-2">
              <p>Event Mode: {layoutData.mode}</p>
              <p>Total Seats: {layoutData.seats.length}</p>
              <p>Ticket Types: {layoutData.ticketTypes.length}</p>
              <p>Ticket Types: {layoutData.ticketTypes.length}</p>
            </div>
          )}
        </div>

        <SeatingLayoutV2
          eventId={41}
          onSelectionComplete={handleSelectionComplete}
          maxSeats={8}
          showLegend={true}
          className="seating-demo"
        />
      </div>
    </div>
  );
};

export default SeatingDemo;
