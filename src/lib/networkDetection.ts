/**
 * Network detection utility for WiFi vs Mobile data
 */

export interface NetworkStatus {
  type: 'wifi' | 'cellular' | 'unknown';
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  saveData: boolean;
  downlink: number | null;
  rtt: number | null;
}

class NetworkDetection {
  private listeners: Set<(status: NetworkStatus) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupListeners();
    }
  }

  private setupListeners() {
    const connection = this.getConnection();
    if (connection) {
      connection.addEventListener('change', () => {
        this.notifyListeners();
      });
    }
  }

  private getConnection(): any {
    if (typeof navigator === 'undefined') return null;
    return (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  }

  getNetworkStatus(): NetworkStatus {
    const connection = this.getConnection();

    if (!connection) {
      return {
        type: 'unknown',
        effectiveType: 'unknown',
        saveData: false,
        downlink: null,
        rtt: null,
      };
    }

    // Check if WiFi
    const type = (connection.type || connection.getType?.() || '').toLowerCase();
    const isWifi = type === 'wifi' || type === 'wifi-unknown';

    return {
      type: isWifi ? 'wifi' : type === 'cellular' || type === 'mobile' ? 'cellular' : 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      saveData: connection.saveData || false,
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
    };
  }

  isWifi(): boolean {
    return this.getNetworkStatus().type === 'wifi';
  }

  isCellular(): boolean {
    return this.getNetworkStatus().type === 'cellular';
  }

  subscribe(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.add(callback);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    const status = this.getNetworkStatus();
    this.listeners.forEach(callback => callback(status));
  }
}

export const networkDetection = new NetworkDetection();
