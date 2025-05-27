import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CameraCapture } from './CameraCapture';
import { FileUpload } from './FileUpload';
import { getRegistrantById, updateRegistrant } from '../services/registrationService';
import { RegistrantFormData } from '../types';
import { UserCog, ArrowLeft } from 'lucide-react';

// Form validation schema
const editSchema = z.object({
  fullName: z.string().min(3, 'Full name is required and must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  dateOfBirth: z.string().refine(val => {
    const date = new Date(val);
    const today = new Date();
    return date < today;
  }, { message: 'Date of birth must be in the past' }),
});

type EditFormValues = z.infer<typeof editSchema>;

export const EditRegistrant: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [photoData, setPhotoData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadType, setUploadType] = useState<'camera' | 'file'>('file');
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (!id) {
      navigate('/admin/dashboard');
      return;
    }

    // Load registrant data
    const registrant = getRegistrantById(id);
    if (!registrant) {
      setError('Registrant not found');
      setIsLoading(false);
      return;
    }

    // Set form values
    setValue('fullName', registrant.fullName);
    setValue('email', registrant.email);
    setValue('phone', registrant.phone);
    setValue('address', registrant.address);
    setValue('gender', registrant.gender);
    setValue('dateOfBirth', registrant.dateOfBirth);
    
    // Set photo data
    if (registrant.photoData) {
      setPhotoData(registrant.photoData);
    }
    
    setIsLoading(false);
  }, [id, navigate, setValue]);

  const handlePhotoCapture = (imageSrc: string) => {
    setPhotoData(imageSrc);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPhotoData(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: EditFormValues) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const registrantData: RegistrantFormData = {
        ...data,
        photoData,
      };

      const result = await updateRegistrant(id, registrantData);
      if (result) {
        navigate('/admin/dashboard');
      } else {
        setError('Failed to update registrant');
      }
    } catch (error) {
      console.error('Error updating registrant:', error);
      setError('An error occurred while updating the registrant');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-2xl mx-auto">
        <div className="bg-red-600 py-4 px-6">
          <h1 className="text-white text-xl font-bold">Error</h1>
        </div>
        <div className="p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-2xl mx-auto">
      <div className="bg-indigo-600 py-4 px-6 flex items-center">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="mr-4 text-white hover:text-indigo-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-white text-xl font-bold flex items-center">
          <UserCog className="mr-2 h-6 w-6" />
          Edit Registrant
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              {...register('fullName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ border: errors.fullName ? '1px solid red' : '' }}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ border: errors.email ? '1px solid red' : '' }}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              {...register('phone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ border: errors.phone ? '1px solid red' : '' }}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input
                  id="male"
                  type="radio"
                  value="male"
                  {...register('gender')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="male" className="ml-2 block text-sm text-gray-700">
                  Male
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="female"
                  type="radio"
                  value="female"
                  {...register('gender')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="female" className="ml-2 block text-sm text-gray-700">
                  Female
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="other"
                  type="radio"
                  value="other"
                  {...register('gender')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="other" className="ml-2 block text-sm text-gray-700">
                  Other
                </label>
              </div>
            </div>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              {...register('dateOfBirth')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ border: errors.dateOfBirth ? '1px solid red' : '' }}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            {...register('address')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            style={{ border: errors.address ? '1px solid red' : '' }}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        {/* Photo Upload */}
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setUploadType('camera')}
                className={`px-4 py-2 rounded-md ${
                  uploadType === 'camera'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Use Camera
              </button>
              <button
                type="button"
                onClick={() => setUploadType('file')}
                className={`px-4 py-2 rounded-md ${
                  uploadType === 'file'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          {uploadType === 'camera' ? (
            <CameraCapture onCapture={handlePhotoCapture} existingImage={photoData} />
          ) : (
            <FileUpload onFileSelect={handleFileUpload} />
          )}

          {photoData && uploadType === 'file' && (
            <div className="mt-4 relative w-full max-w-md">
              <img 
                src={photoData} 
                alt="Current" 
                className="w-full h-auto rounded-lg border-2 border-gray-300" 
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="mr-4 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};