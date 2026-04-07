export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); 
  
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};