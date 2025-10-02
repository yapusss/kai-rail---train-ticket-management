import trainServicesData from '../data/trainServices.json';
import {
  TrainServicesData,
  Station,
  TrainService,
  ServiceCategory,
  Hotel,
  CarRental,
  LogisticsService,
  InsuranceService
} from '../data/types';

// Type assertion for the imported JSON data
const data = trainServicesData as unknown as TrainServicesData;

export class TrainDataService {
  // Station methods
  static getAllStations(): Station[] {
    return Object.values(data.stations).flat();
  }

  static getStationsByCity(city: string): Station[] {
    return data.stations[city] || [];
  }

  static getStationByCode(code: string): Station | null {
    for (const cityStations of Object.values(data.stations)) {
      const station = cityStations.find(s => s.code === code);
      if (station) return station;
    }
    return null;
  }

  // Train service methods
  static getAllTrainServices(): ServiceCategory[] {
    return Object.values(data.trainServices);
  }

  static getTrainServiceById(id: string): ServiceCategory | null {
    return data.trainServices[id as keyof typeof data.trainServices] || null;
  }

  static getInterCityTrains(): TrainService[] {
    return data.trainServices.intercity.trains || [];
  }

  static getLocalTrains(): TrainService[] {
    return data.trainServices.local.trains || [];
  }

  static getCommuterLines(): any[] {
    return data.trainServices.commuter.lines || [];
  }

  static getLRTSystems(): any[] {
    return data.trainServices.lrt.systems || [];
  }

  static getAirportServices(): any[] {
    return data.trainServices.airport.services || [];
  }

  // Search methods
  static searchTrainsByRoute(fromCode: string, toCode: string): TrainService[] {
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
  }

  static getTrainsByCity(cityCode: string): TrainService[] {
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
  }

  static searchTrainsByCityName(cityName: string): TrainService[] {
    const cityStations = this.getStationsByCity(cityName.toLowerCase());
    const results: TrainService[] = [];
    
    cityStations.forEach(station => {
      const trains = this.getTrainsByCity(station.code);
      results.push(...trains);
    });
    
    return results;
  }

  static searchTrainsByPriceRange(minPrice: number, maxPrice: number): TrainService[] {
    const results: TrainService[] = [];
    
    Object.values(data.trainServices).forEach(category => {
      if (category.trains) {
        category.trains.forEach(train => {
          train.classes.forEach(trainClass => {
            if (trainClass.price >= minPrice && trainClass.price <= maxPrice) {
              results.push(train);
            }
          });
        });
      }
    });
    
    return results;
  }

  static searchTrainsByDuration(maxDuration: string): TrainService[] {
    const results: TrainService[] = [];
    
    // Parse duration string like "8h 30m" to minutes
    const parseDuration = (duration: string): number => {
      const match = duration.match(/(\d+)h\s*(\d+)?m?/);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        return hours * 60 + minutes;
      }
      return 0;
    };

    const maxDurationMinutes = parseDuration(maxDuration);
    
    Object.values(data.trainServices).forEach(category => {
      if (category.trains) {
        category.trains.forEach(train => {
          if (parseDuration(train.duration) <= maxDurationMinutes) {
            results.push(train);
          }
        });
      }
    });
    
    return results;
  }

  // Hotel methods
  static getAllHotels(): Hotel[] {
    try {
      console.log('Getting all hotels, data.hotels:', data.hotels);
      const hotels = Object.values(data.hotels).flat();
      console.log('All hotels:', hotels);
      return hotels;
    } catch (error) {
      console.error('Error getting hotels:', error);
      return [];
    }
  }

  static getHotelsByCity(city: string): Hotel[] {
    return data.hotels[city.toLowerCase()] || [];
  }

  static searchHotelsByPriceRange(minPrice: number, maxPrice: number): Hotel[] {
    const allHotels = this.getAllHotels();
    return allHotels.filter(hotel => hotel.price >= minPrice && hotel.price <= maxPrice);
  }

  static searchHotelsByCity(city: string): Hotel[] {
    return this.getHotelsByCity(city);
  }

  // Car rental methods
  static getAllCarRentals(): CarRental[] {
    try {
      console.log('Getting all car rentals, data.carRentals:', data.carRentals);
      const carRentals = Object.values(data.carRentals).flat();
      console.log('All car rentals:', carRentals);
      return carRentals;
    } catch (error) {
      console.error('Error getting car rentals:', error);
      return [];
    }
  }

  static getCarRentalsByCity(city: string): CarRental[] {
    return data.carRentals[city.toLowerCase()] || [];
  }

  static searchCarRentalsByType(type: string): CarRental[] {
    const allCarRentals = this.getAllCarRentals();
    return allCarRentals.filter(car => car.type.toLowerCase().includes(type.toLowerCase()));
  }

  // Logistics methods
  static getAllLogisticsServices(): LogisticsService[] {
    return data.logistics;
  }

  static searchLogisticsByRoute(route: string): LogisticsService[] {
    return data.logistics.filter(logistic => 
      logistic.route.toLowerCase().includes(route.toLowerCase())
    );
  }

  // Insurance methods
  static getAllInsuranceServices(): InsuranceService[] {
    return data.insurance;
  }

  static searchInsuranceByCoverage(coverage: string): InsuranceService[] {
    return data.insurance.filter(insurance => 
      insurance.coverage.toLowerCase().includes(coverage.toLowerCase())
    );
  }

  // Utility methods
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  static getServiceIcon(serviceType: string): string {
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
  }

  // Advanced search methods
  static searchAllServices(query: string): {
    trains: TrainService[];
    hotels: Hotel[];
    carRentals: CarRental[];
    logistics: LogisticsService[];
    insurance: InsuranceService[];
  } {
    const lowerQuery = query.toLowerCase();
    
    try {
      // Search trains
      const trains: TrainService[] = [];
      Object.values(data.trainServices).forEach(category => {
        if (category.trains) {
          category.trains.forEach(train => {
            if (
              train.name.toLowerCase().includes(lowerQuery) ||
              train.route.from.city.toLowerCase().includes(lowerQuery) ||
              train.route.to.city.toLowerCase().includes(lowerQuery) ||
              train.route.from.name.toLowerCase().includes(lowerQuery) ||
              train.route.to.name.toLowerCase().includes(lowerQuery)
            ) {
              trains.push(train);
            }
          });
        }
      });

      // Search hotels
      const hotels = this.getAllHotels().filter(hotel =>
        hotel.name.toLowerCase().includes(lowerQuery) ||
        hotel.location.toLowerCase().includes(lowerQuery)
      );

      // Search car rentals
      const carRentals = this.getAllCarRentals().filter(car =>
        car.name.toLowerCase().includes(lowerQuery) ||
        car.location.toLowerCase().includes(lowerQuery) ||
        car.type.toLowerCase().includes(lowerQuery)
      );

      // Search logistics
      const logistics = data.logistics.filter(logistic =>
        logistic.name.toLowerCase().includes(lowerQuery) ||
        logistic.route.toLowerCase().includes(lowerQuery)
      );

      // Search insurance
      const insurance = data.insurance.filter(ins =>
        ins.name.toLowerCase().includes(lowerQuery) ||
        ins.coverage.toLowerCase().includes(lowerQuery)
      );

      return {
        trains,
        hotels,
        carRentals,
        logistics,
        insurance
      };
    } catch (error) {
      console.error('Error in searchAllServices:', error);
      return {
        trains: [],
        hotels: [],
        carRentals: [],
        logistics: [],
        insurance: []
      };
    }
  }

  // Get service statistics
  static getServiceStatistics() {
    return {
      totalStations: this.getAllStations().length,
      totalTrains: Object.values(data.trainServices).reduce((acc, category) => 
        acc + (category.trains?.length || category.lines?.length || category.systems?.length || category.services?.length || 0), 0),
      totalHotels: this.getAllHotels().length,
      totalCarRentals: this.getAllCarRentals().length,
      totalLogisticsServices: data.logistics.length,
      totalInsuranceServices: data.insurance.length
    };
  }

  // Test method untuk debugging
  static testSearch() {
    console.log('=== TESTING SEARCH FUNCTIONALITY ===');
    console.log('Data structure:', {
      stations: Object.keys(data.stations),
      trainServices: Object.keys(data.trainServices),
      hotels: Object.keys(data.hotels),
      carRentals: Object.keys(data.carRentals),
      logistics: data.logistics.length,
      insurance: data.insurance.length
    });
    
    console.log('Testing search for "hotel":');
    const hotelResults = this.searchAllServices('hotel');
    console.log('Hotel search results:', hotelResults);
    
    console.log('Testing search for "jakarta":');
    const jakartaResults = this.searchAllServices('jakarta');
    console.log('Jakarta search results:', jakartaResults);
  }
}

export default TrainDataService;