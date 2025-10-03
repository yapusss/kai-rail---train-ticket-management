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
import Swal from 'sweetalert2';

const data = trainServicesData as unknown as TrainServicesData;

export class TrainDataService {
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

  static searchTrainsByRoute(fromCode: string, toCode: string): TrainService[] {
    const results: TrainService[] = [];
    
    if (data.trainServices.intercity.trains) {
      data.trainServices.intercity.trains.forEach(train => {
        if (train.route.from.code === fromCode && train.route.to.code === toCode) {
          results.push(train);
        }
      });
    }
    
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

  static getAllHotels(): Hotel[] {
    try {
      console.log('Getting all hotels, data.hotels:', data.hotels);
      const hotels = Object.values(data.hotels).flat();
      console.log('All hotels:', hotels);
      return hotels;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan Data',
        text: 'Terjadi kesalahan saat mengambil data hotel.',
        confirmButtonText: 'Baik'
      });
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

  static getAllCarRentals(): CarRental[] {
    try {
      console.log('Getting all car rentals, data.carRentals:', data.carRentals);
      const carRentals = Object.values(data.carRentals).flat();
      console.log('All car rentals:', carRentals);
      return carRentals;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan Data',
        text: 'Terjadi kesalahan saat mengambil data rental mobil.',
        confirmButtonText: 'Baik'
      });
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

  static getAllLogisticsServices(): LogisticsService[] {
    return data.logistics;
  }

  static searchLogisticsByRoute(route: string): LogisticsService[] {
    return data.logistics.filter(logistic => 
      logistic.route.toLowerCase().includes(route.toLowerCase())
    );
  }

  static getAllInsuranceServices(): InsuranceService[] {
    return data.insurance;
  }

  static searchInsuranceByCoverage(coverage: string): InsuranceService[] {
    return data.insurance.filter(insurance => 
      insurance.coverage.toLowerCase().includes(coverage.toLowerCase())
    );
  }

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

  static searchAllServices(query: string): {
    trains: TrainService[];
    hotels: Hotel[];
    carRentals: CarRental[];
    logistics: LogisticsService[];
    insurance: InsuranceService[];
  } {
    const lowerQuery = query.toLowerCase();
    
    try {
      const parsedQuery = this.parseNaturalLanguageQuery(lowerQuery);
      console.log('Parsed query:', parsedQuery);
      
      const trains: TrainService[] = [];
      Object.values(data.trainServices).forEach(category => {
        if (category.trains) {
          category.trains.forEach(train => {
            if (this.matchesTrain(train, parsedQuery)) {
              trains.push(train);
            }
          });
        }
      });

      const hotels = this.getAllHotels().filter(hotel =>
        this.matchesHotel(hotel, parsedQuery)
      );

      const carRentals = this.getAllCarRentals().filter(car =>
        this.matchesCarRental(car, parsedQuery)
      );

      const logistics = data.logistics.filter(logistic =>
        this.matchesLogistics(logistic, parsedQuery)
      );

      const insurance = data.insurance.filter(ins =>
        this.matchesInsurance(ins, parsedQuery)
      );

      return {
        trains,
        hotels,
        carRentals,
        logistics,
        insurance
      };
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan Pencarian',
        text: 'Terjadi kesalahan saat melakukan pencarian.',
        confirmButtonText: 'Baik'
      });
      return {
        trains: [],
        hotels: [],
        carRentals: [],
        logistics: [],
        insurance: []
      };
    }
  }

  static parseNaturalLanguageQuery(query: string) {
    const cities = ['jakarta', 'bandung', 'surabaya', 'yogyakarta', 'semarang', 'malang', 'denpasar'];
    const services = ['hotel', 'hotel', 'tiket', 'kereta', 'train', 'rental', 'mobil', 'car', 'logistik', 'logistics', 'asuransi', 'insurance'];
    
    const words = query.split(/\s+/);
    const result: any = {
      originalQuery: query,
      words: words,
      cities: [],
      services: [],
      keywords: []
    };

    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cities.includes(cleanWord)) {
        result.cities.push(cleanWord);
      }
    });

    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (services.includes(cleanWord)) {
        result.services.push(cleanWord);
      }
    });

    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length > 2 && !result.cities.includes(cleanWord) && !result.services.includes(cleanWord)) {
        result.keywords.push(cleanWord);
      }
    });

    return result;
  }

  static matchesTrain(train: any, parsedQuery: any): boolean {
    const { cities, services, keywords, originalQuery } = parsedQuery;
    
    const hasTrainService = services.some((s: string) => ['tiket', 'kereta', 'train'].includes(s));
    const hasTrainKeywords = keywords.some((k: string) => 
      ['argo', 'bima', 'bromo', 'jayakarta', 'krd', 'commuter'].includes(k)
    );
    
    if (hasTrainService || hasTrainKeywords) {
      if (cities.length > 0) {
        const matchesRoute = cities.some((city: string) =>
          train.route.from.city.toLowerCase().includes(city) ||
          train.route.to.city.toLowerCase().includes(city)
        );
        return matchesRoute;
      }
      
      return train.name.toLowerCase().includes(originalQuery) ||
             originalQuery.includes(train.name.toLowerCase()) ||
             hasTrainKeywords;
    }
    
    return train.name.toLowerCase().includes(originalQuery) ||
           train.route.from.city.toLowerCase().includes(originalQuery) ||
           train.route.to.city.toLowerCase().includes(originalQuery);
  }

  static matchesHotel(hotel: any, parsedQuery: any): boolean {
    const { cities, services, keywords, originalQuery } = parsedQuery;
    
    const hasHotelService = services.some((s: string) => ['hotel', 'hotel'].includes(s));
    
    if (hasHotelService) {
      if (cities.length > 0) {
        const matchesCity = cities.some((city: string) =>
          hotel.location.toLowerCase().includes(city)
        );
        return matchesCity;
      }
      
      return hotel.name.toLowerCase().includes(originalQuery) ||
             keywords.some((k: string) => hotel.name.toLowerCase().includes(k));
    }
    
    return hotel.name.toLowerCase().includes(originalQuery) ||
           hotel.location.toLowerCase().includes(originalQuery);
  }

  static matchesCarRental(car: any, parsedQuery: any): boolean {
    const { cities, services, keywords, originalQuery } = parsedQuery;
    
    const hasCarService = services.some((s: string) => ['rental', 'mobil', 'car'].includes(s));
    
    if (hasCarService) {
      if (cities.length > 0) {
        const matchesCity = cities.some((city: string) =>
          car.location.toLowerCase().includes(city)
        );
        return matchesCity;
      }
      
      return car.name.toLowerCase().includes(originalQuery) ||
             car.type.toLowerCase().includes(originalQuery);
    }
    
    return car.name.toLowerCase().includes(originalQuery) ||
           car.location.toLowerCase().includes(originalQuery) ||
           car.type.toLowerCase().includes(originalQuery);
  }

  static matchesLogistics(logistic: any, parsedQuery: any): boolean {
    const { services, originalQuery } = parsedQuery;
    
    const hasLogisticsService = services.some((s: string) => ['logistik', 'logistics'].includes(s));
    
    if (hasLogisticsService) {
      return true;
    }
    
    return logistic.name.toLowerCase().includes(originalQuery) ||
           logistic.route.toLowerCase().includes(originalQuery);
  }

  static matchesInsurance(insurance: any, parsedQuery: any): boolean {
    const { services, originalQuery } = parsedQuery;
    
    const hasInsuranceService = services.some((s: string) => ['asuransi', 'insurance'].includes(s));
    
    if (hasInsuranceService) {
      return true; 
    }
    
    return insurance.name.toLowerCase().includes(originalQuery) ||
           insurance.coverage.toLowerCase().includes(originalQuery);
  }

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

  static getAllTrainsByCategory(category: string): TrainService[] {
    const serviceCategory = data.trainServices[category as keyof typeof data.trainServices];
    return serviceCategory?.trains || [];
  }

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