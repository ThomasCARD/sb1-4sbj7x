export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-900 text-yellow-100';
    case 'in_progress':
      return 'bg-blue-900 text-blue-100';
    case 'finished':
      return 'bg-green-900 text-green-100';
    case 'aborted':
      return 'bg-red-900 text-red-100';
    default:
      return 'bg-gray-900 text-gray-100';
  }
}