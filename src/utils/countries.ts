// Extract and sort country names from countryToCode mapping
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

// Format country names to be properly capitalized
const formatCountryName = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get unique, formatted country names
const countries = Array.from(new Set(
  Object.keys(countryToCode)
    .filter(name => name !== 'uk' && name !== 'usa') // Remove duplicates
    .map(formatCountryName)
    .sort()
));

export { countries, countryToCode };