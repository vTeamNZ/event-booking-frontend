// Timer Debug Helper - Add to browser console
window.debugTimer = {
    // Create test reservation
    createReservation() {
        const testReservation = {
            reservationId: "debug-test-123",
            eventId: 21,
            sessionId: "debug-session",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
            seatsCount: 2,
            totalPrice: 50.00
        };
        localStorage.setItem('activeReservation', JSON.stringify(testReservation));
        console.log('✅ Test reservation created:', testReservation);
        return testReservation;
    },
    
    // Check current reservation
    checkReservation() {
        const stored = localStorage.getItem('activeReservation');
        if (stored) {
            const parsed = JSON.parse(stored);
            const expiresAt = new Date(parsed.expiresAt);
            const now = new Date();
            const timeLeft = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
            console.log('📋 Current reservation:', parsed);
            console.log('⏱️ Time left:', timeLeft, 'seconds');
            console.log('🕐 Expires at:', expiresAt.toLocaleString());
            return { reservation: parsed, timeLeft, expired: timeLeft <= 0 };
        } else {
            console.log('❌ No active reservation found');
            return null;
        }
    },
    
    // Clear reservation
    clearReservation() {
        localStorage.removeItem('activeReservation');
        console.log('🗑️ Reservation cleared');
    },
    
    // Check timer visibility
    checkTimerVisibility() {
        const timer = document.querySelector('[class*="fixed"][class*="top-0"]');
        if (timer) {
            console.log('✅ Timer element found:', timer);
            console.log('📏 Timer position:', timer.getBoundingClientRect());
            console.log('🎨 Timer styles:', getComputedStyle(timer));
            return timer;
        } else {
            console.log('❌ Timer element not found in DOM');
            return null;
        }
    },
    
    // Full debug run
    fullDebug() {
        console.log('🔍 === TIMER DEBUG START ===');
        console.log('📍 Current route:', window.location.pathname);
        
        this.checkReservation();
        this.checkTimerVisibility();
        
        console.log('🔍 === TIMER DEBUG END ===');
    },
    
    // Test on specific routes
    testOnRoutes() {
        console.log('🧪 Testing timer on different routes...');
        
        // Create reservation
        this.createReservation();
        
        const routes = [
            '/event/test-event/food',
            '/payment-summary', 
            '/payment'
        ];
        
        routes.forEach((route, index) => {
            setTimeout(() => {
                console.log(`\n🚀 Testing route: ${route}`);
                window.history.pushState({}, '', route);
                setTimeout(() => {
                    this.fullDebug();
                }, 500);
            }, index * 2000);
        });
    }
};

console.log('🛠️ Timer debug helper loaded!');
console.log('📋 Available commands:');
console.log('  debugTimer.createReservation() - Create test reservation');
console.log('  debugTimer.checkReservation() - Check current reservation');
console.log('  debugTimer.checkTimerVisibility() - Check if timer is visible');
console.log('  debugTimer.fullDebug() - Run complete debug');
console.log('  debugTimer.testOnRoutes() - Test timer on food/payment pages');
