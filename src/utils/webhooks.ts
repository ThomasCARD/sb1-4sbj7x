import { Customer } from '../stores/customerStore';

const WEBHOOK_BASE_URL = 'https://hook.eu2.make.com';
const CREATE_ACCOUNT_WEBHOOK = `${WEBHOOK_BASE_URL}/2jfkns02v5r49wdju9lvns5vwt3ph696`;
const NEW_CUSTOMER_WEBHOOK = `${WEBHOOK_BASE_URL}/2jfkns02v5r49wdju9lvns5vwt3ph696`;
const EDIT_PROFILE_WEBHOOK = `${WEBHOOK_BASE_URL}/2jfkns02v5r49wdju9lvns5vwt3ph696`;

export async function sendCreateAccountWebhook(data: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  try {
    const params = new URLSearchParams({
      firstname: data.firstName,
      lastname: data.lastName,
      email: data.email
    });

    const response = await fetch(`${CREATE_ACCOUNT_WEBHOOK}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to send webhook');
    }
  } catch (error) {
    console.error('Error sending create account webhook:', error);
    throw error;
  }
}

export async function sendNewCustomerWebhook(data: Customer) {
  try {
    const params = new URLSearchParams({
      firstname: data.firstName,
      lastname: data.lastName,
      email: data.email,
      phone: data.phone,
      street: data.address.street,
      city: data.address.city,
      'postal code': data.address.postalCode,
      country: data.address.country
    });

    const response = await fetch(`${NEW_CUSTOMER_WEBHOOK}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to send webhook');
    }
  } catch (error) {
    console.error('Error sending new customer webhook:', error);
    throw error;
  }
}

export async function sendEditProfileWebhook(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}) {
  try {
    const params = new URLSearchParams({
      firstname: data.firstName,
      lastname: data.lastName,
      email: data.email,
      phone: data.phone,
      street: data.address.street,
      city: data.address.city,
      'postal code': data.address.postalCode,
      country: data.address.country
    });

    const response = await fetch(`${EDIT_PROFILE_WEBHOOK}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to send webhook');
    }
  } catch (error) {
    console.error('Error sending edit profile webhook:', error);
    throw error;
  }
}