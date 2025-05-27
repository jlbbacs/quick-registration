import { Registrant, RegistrantFormData } from '../types';

// Mock database using localStorage
const STORAGE_KEY = 'registrants';

// Initialize storage if empty
const initializeStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

// Get all registrants
export const getAllRegistrants = (): Registrant[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};

// Get a single registrant by ID
export const getRegistrantById = (id: string): Registrant | undefined => {
  const registrants = getAllRegistrants();
  return registrants.find(registrant => registrant.id === id);
};

// Add a new registrant
export const addRegistrant = async (data: RegistrantFormData): Promise<Registrant> => {
  const registrants = getAllRegistrants();
  
  // Create a new registrant object
  const newRegistrant: Registrant = {
    id: crypto.randomUUID(),
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    photoData: data.photoData, // Store base64 encoded image data
    photoPath: data.photoData ? `photo_${Date.now()}.jpg` : '', // Simulate a file path
    createdAt: new Date().toISOString(),
  };

  // Add to the list and save
  registrants.push(newRegistrant);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrants));
  
  return newRegistrant;
};

// Update an existing registrant
export const updateRegistrant = async (id: string, data: RegistrantFormData): Promise<Registrant | null> => {
  const registrants = getAllRegistrants();
  const index = registrants.findIndex(registrant => registrant.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // Update the registrant
  const updatedRegistrant: Registrant = {
    ...registrants[index],
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth,
    photoData: data.photoData || registrants[index].photoData, // Keep existing photo if not changed
    photoPath: data.photoData 
      ? `photo_${Date.now()}.jpg` // New path for new photo
      : registrants[index].photoPath, // Keep existing path
  };
  
  // Update in the list and save
  registrants[index] = updatedRegistrant;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrants));
  
  return updatedRegistrant;
};

// Delete a registrant
export const deleteRegistrant = (id: string): boolean => {
  const registrants = getAllRegistrants();
  const filteredRegistrants = registrants.filter(registrant => registrant.id !== id);
  
  if (filteredRegistrants.length === registrants.length) {
    return false; // No registrant found with that ID
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRegistrants));
  return true;
};