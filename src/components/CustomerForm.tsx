import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, MapPin, Waves, Plus } from 'lucide-react';
import { Autocomplete } from './Autocomplete';
import { useSurfboardDataStore } from '../stores/surfboardDataStore';
import { countries } from '../utils/countries';
import { useCustomerStore } from '../stores/customerStore';
import clsx from 'clsx';

// ... [Previous constants remain the same]

export function CustomerForm({ onSubmit, onClose, initialData }: CustomerFormProps) {
  // ... [Previous state declarations remain the same]

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = async (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!initialData) {
      try {
        const exists = await checkEmailExists(email);
        if (exists) {
          setEmailError('This email is already registered. Please use a different email address.');
        }
      } catch (error) {
        console.error('Email check error:', error);
        // Don't set error message here - let the user proceed and handle actual registration errors later
      }
    }
  };

  // ... [Rest of the component remains exactly the same]
}