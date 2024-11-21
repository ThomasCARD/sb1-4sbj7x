import { Customer } from '../stores/customerStore';

const REPAIR_FINISHED_WEBHOOK = 'https://hook.eu2.make.com/f4j562oyfizihqrf6fg239sgmxdlkmre';
const NEW_REPAIR_WEBHOOK = 'https://hook.eu2.make.com/8vl9vu093dy5nhmpg5axjt8yxp3v65d5';
const NEW_CUSTOMER_WEBHOOK = 'https://hook.eu2.make.com/2jfkns02v5r49wdju9lvns5vwt3ph696';

// ISO 3166-1 alpha-2 country code mapping
const countryToCode: { [key: string]: string } = {
  'france': 'FR',
  'spain': 'ES',
  'portugal': 'PT',
  'germany': 'DE',
  'italy': 'IT',
  'united kingdom': 'GB',
  'uk': 'GB',
  'ireland': 'IE',
  'netherlands': 'NL',
  'belgium': 'BE',
  'switzerland': 'CH',
  'austria': 'AT',
  'sweden': 'SE',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'united states': 'US',
  'usa': 'US',
  'canada': 'CA',
  'australia': 'AU',
  'new zealand': 'NZ',
  'japan': 'JP',
  'china': 'CN',
  'brazil': 'BR',
  'morocco': 'MA'
};

function getCountryCode(countryName: string): string {
  if (!countryName) return 'FR';
  const normalizedName = countryName.trim().toLowerCase();
  return countryToCode[normalizedName] || 'FR';
}

export async function sendNewCustomerEmail(customerData: {
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  companyDetails?: {
    name: string;
    vatNumber: string;
  };
}) {
  try {
    const params = new URLSearchParams({
      firstname: customerData.firstName,
      lastname: customerData.lastName,
      email: customerData.email,
      type: customerData.type,
      date: new Date().toISOString(),
      company_name: customerData.companyDetails?.name || '',
      vat_number: customerData.companyDetails?.vatNumber || ''
    });

    const response = await fetch(`${NEW_CUSTOMER_WEBHOOK}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to send welcome email');
    }

    return response;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

export async function sendNewRepairEmail(repair: any, customer: Customer) {
  try {
    if (!repair || !customer) {
      throw new Error('Missing repair or customer data');
    }

    // Convert country to 2-letter code for webhook
    const countryCode = getCountryCode(customer.address?.country || '');

    const params = new URLSearchParams();

    // Customer details
    params.append('customer_id', customer.id || '');
    params.append('customer_first_name', customer.firstName || '');
    params.append('customer_last_name', customer.lastName || '');
    params.append('customer_email', customer.email || '');
    params.append('customer_phone', customer.phone || '');
    params.append('customer_type', customer.type || '');

    // Address details with country code
    params.append('customer_street', customer.address?.street || '');
    params.append('customer_city', customer.address?.city || '');
    params.append('customer_postal', customer.address?.postalCode || '');
    params.append('customer_country', countryCode);

    // Company details
    if (customer.companyDetails) {
      params.append('company_name', customer.companyDetails.name || '');
      params.append('company_vat', customer.companyDetails.vatNumber || '');
    }

    // Repair details
    params.append('repair_id', repair.repairId?.toString() || '');
    params.append('board_model', repair.boardModel || '');
    params.append('delivery_date', repair.deliveryDate || '');
    params.append('status', repair.status || '');
    params.append('is_direct', repair.isDirect ? 'true' : 'false');

    // Pricing details
    params.append('subtotal', repair.pricing?.subtotal?.toString() || '0');
    params.append('discount_type', repair.pricing?.discountType || '');
    params.append('discount_value', repair.pricing?.discountValue?.toString() || '0');
    params.append('discount_amount', repair.pricing?.discountAmount?.toString() || '0');
    params.append('total_price', repair.totalPrice?.toString() || '0');

    // Staff details
    params.append('seller', repair.seller || '');
    params.append('operator', repair.operator || '');

    // Timestamps
    params.append('created_at', repair.createdAt || new Date().toISOString());

    // Repairs list
    if (Array.isArray(repair.repairs)) {
      repair.repairs.forEach((r: any, index: number) => {
        if (r?.repairType) {
          const prefix = `repair_${index + 1}_`;
          params.append(`${prefix}type`, r.repairType.name || '');
          params.append(`${prefix}quantity`, r.quantity?.toString() || '1');
          params.append(`${prefix}location`, r.location || '');
          params.append(`${prefix}side`, r.side || '');
          params.append(`${prefix}price`, (
            r.repairType.priceEpoxy || 
            r.repairType.pricePolyester || 
            '0'
          ).toString());
        }
      });
      params.append('repair_count', repair.repairs.length.toString());
    }

    const response = await fetch(`${NEW_REPAIR_WEBHOOK}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error sending new repair notification:', error);
    throw error;
  }
}

export async function sendRepairFinishedEmail(repair: any, customer: Customer) {
  try {
    if (!repair || !customer) {
      throw new Error('Missing repair or customer data');
    }

    const countryCode = getCountryCode(customer.address?.country || '');

    const params = new URLSearchParams({
      customer_id: customer.id,
      customer_first_name: customer.firstName,
      customer_last_name: customer.lastName,
      customer_email: customer.email,
      customer_country: countryCode,
      repair_id: repair.repairId?.toString() || '',
      board_model: repair.boardModel || '',
      total_price: repair.totalPrice?.toString() || '0',
      status: repair.status || '',
      seller: repair.seller || '',
      operator: repair.operator || ''
    });

    const response = await fetch(`${REPAIR_FINISHED_WEBHOOK}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error sending repair finished notification:', error);
    throw error;
  }
}