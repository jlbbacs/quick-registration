export interface Registrant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  photoPath: string;
  photoData?: string; // Base64 encoded image data
  createdAt: string;
}

export type RegistrantFormData = Omit<Registrant, 'id' | 'createdAt' | 'photoPath'> & {
  photo?: File;
};