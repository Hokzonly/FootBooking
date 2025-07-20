export interface Academy {
  id: string;
  name: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  phone: string;
  description: string;
  images: string[];
  fields: Field[];
  image?: string;
  openingHours?: string;
  monthlyPrice?: number;
  gallery?: string[];
}

export interface Field {
  id: string;
  type: string;
  capacity: number;
  pricePerHour: number;
  image: string;
}

export interface Booking {
  id: string;
  academyId: string;
  fieldId: string;
  academyName: string;
  fieldType: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  bookingId?: string;
}