import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CameraCapture } from './CameraCapture';
import { FileUpload } from './FileUpload';
import { addRegistrant } from '../services/registrationService';
import { RegistrantFormData } from '../types';
import { UserPlus } from 'lucide-react';

// Form validation schema
const registrationSchema = z.object({
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

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export const RegistrationForm: React.FC = () => {
  const [photoData, setPhotoData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadType, setUploadType] = useState<'camera' | 'file'>('camera');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      gender: 'male',
    },
  });

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

  const onSubmit = async (data: RegistrationFormValues) => {
    if (!photoData) {
      alert('Please capture or upload a photo');
      return;
    }

    setIsSubmitting(true);
    try {
      const registrantData: RegistrantFormData = {
        ...data,
        photoData,
      };

      await addRegistrant(registrantData);
      setSubmitSuccess(true);
      reset();
      setPhotoData('');
      
      // Reset form after success message
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-2xl mx-auto">
      <div className="bg-indigo-600 py-4 px-6">
        <h1 className="text-white text-xl font-bold flex items-center">
          <UserPlus className="mr-2 h-6 w-6" />
          Registration Form
        </h1>
      </div>

      {submitSuccess ? (
        <div className="p-6 bg-green-50 border-l-4 border-green-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Registration successful! Thank you for registering.
              </p>
            </div>
          </div>
        </div>
      ) : (
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
              <CameraCapture onCapture={handlePhotoCapture} />
            ) : (
              <FileUpload onFileSelect={handleFileUpload} />
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Register'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};