export interface Station {
  code: string;
  name: string;
  city: string;
  province: string;
}

export interface Route {
  from: {
    code: string;
    name: string;
    city: string;
  };
  to: {
    code: string;
    name: string;
    city: string;
  };
}

export interface TrainClass {
  name: string;
  price: number;
  facilities: string[];
}

export interface Schedule {
  departure: string;
  arrival: string;
  days: string[];
}

export interface TrainService {
  id: string;
  name: string;
  code: string;
  route: {
    from: {
      code: string;
      name: string;
      city: string;
    };
    to: {
      code: string;
      name: string;
      city: string;
    };
  };
  duration: string;
  distance: string;
  classes: TrainClass[];
  schedule: Schedule[];
}

export interface CommuterLine {
  id: string;
  name: string;
  code: string;
  route: {
    from: {
      code: string;
      name: string;
      city: string;
    };
    to: {
      code: string;
      name: string;
      city: string;
    };
  };
  duration: string;
  distance: string;
  price: number;
  facilities: string[];
  schedule: {
    weekdays: {
      first: string;
      last: string;
      frequency: string;
    };
    weekends: {
      first: string;
      last: string;
      frequency: string;
    };
  };
}

export interface LRTSystem {
  id: string;
  name: string;
  code: string;
  route: {
    from: {
      code: string;
      name: string;
      city: string;
    };
    to: {
      code: string;
      name: string;
      city: string;
    };
  };
  duration: string;
  distance: string;
  price: number;
  facilities: string[];
  schedule: {
    weekdays: {
      first: string;
      last: string;
      frequency: string;
    };
    weekends: {
      first: string;
      last: string;
      frequency: string;
    };
  };
}

export interface AirportService {
  id: string;
  name: string;
  code: string;
  route: {
    from: {
      code: string;
      name: string;
      city: string;
    };
    to: {
      code: string;
      name: string;
      city: string;
    };
  };
  duration: string;
  distance: string;
  price: number;
  facilities: string[];
  schedule: {
    weekdays: {
      first: string;
      last: string;
      frequency: string;
    };
    weekends: {
      first: string;
      last: string;
      frequency: string;
    };
  };
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  bgColor: string;
  trains?: TrainService[];
  lines?: CommuterLine[];
  systems?: LRTSystem[];
  services?: AirportService[];
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  amenities: string[];
  address: string;
  phone: string;
}

export interface CarRental {
  id: string;
  name: string;
  location: string;
  price: number;
  type: string;
  rating: number;
  address: string;
  phone: string;
}

export interface LogisticsService {
  id: string;
  name: string;
  route: string;
  price: number;
  duration: string;
  type: string;
  description: string;
}

export interface InsuranceService {
  id: string;
  name: string;
  coverage: string;
  price: number;
  duration: string;
  description: string;
}

export interface TrainServicesData {
  stations: {
    [city: string]: Station[];
  };
  trainServices: {
    intercity: ServiceCategory;
    local: ServiceCategory;
    commuter: ServiceCategory;
    lrt: ServiceCategory;
    airport: ServiceCategory;
  };
  hotels: {
    [city: string]: Hotel[];
  };
  carRentals: {
    [city: string]: CarRental[];
  };
  logistics: LogisticsService[];
  insurance: InsuranceService[];
}

// Helper functions for working with the data
export const getStationByCode = (stations: { [city: string]: Station[] }, code: string): Station | null => {
  for (const cityStations of Object.values(stations)) {
    const station = cityStations.find(s => s.code === code);
    if (station) return station;
  }
  return null;
};

export const getStationsByCity = (stations: { [city: string]: Station[] }, city: string): Station[] => {
  return stations[city] || [];
};

export const getAllStations = (stations: { [city: string]: Station[] }): Station[] => {
  return Object.values(stations).flat();
};

export const searchTrainsByRoute = (data: TrainServicesData, fromCode: string, toCode: string): TrainService[] => {
  const results: TrainService[] = [];
  
  // Search in intercity trains
  if (data.trainServices.intercity.trains) {
    data.trainServices.intercity.trains.forEach(train => {
      if (train.route.from.code === fromCode && train.route.to.code === toCode) {
        results.push(train);
      }
    });
  }
  
  // Search in local trains
  if (data.trainServices.local.trains) {
    data.trainServices.local.trains.forEach(train => {
      if (train.route.from.code === fromCode && train.route.to.code === toCode) {
        results.push(train);
      }
    });
  }
  
  return results;
};

export const getTrainsByCity = (data: TrainServicesData, cityCode: string): TrainService[] => {
  const results: TrainService[] = [];
  
  // Search in all train categories
  Object.values(data.trainServices).forEach(category => {
    if (category.trains) {
      category.trains.forEach(train => {
        if (train.route.from.code === cityCode || train.route.to.code === cityCode) {
          results.push(train);
        }
      });
    }
  });
  
  return results;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatDuration = (duration: string): string => {
  return duration; // Already formatted as "8h 30m"
};

export const getServiceIcon = (serviceType: string): string => {
  const icons: { [key: string]: string } = {
    intercity: '🚄',
    local: '🚂',
    commuter: '🚇',
    lrt: '🚈',
    airport: '✈️',
    hotel: '🏨',
    car: '🚗',
    logistics: '📦',
    insurance: '🛡️',
  };
  return icons[serviceType] || '🚀';
};
