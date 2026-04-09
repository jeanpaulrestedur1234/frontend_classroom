/**
 * Mock service for file uploads.
 * returns a simulated URL for the uploaded file.
 */
export async function uploadFile(file: File): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  console.log('Mock upload of file:', file.name);
  
  // Return a mock URL (could be a blob URL or a placeholder)
  return `https://storage.googleapis.com/class-receipts/mock-upt-at-${Date.now()}-${file.name}`;
}
