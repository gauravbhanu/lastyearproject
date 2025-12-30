export interface VehicleData {
  id: string; // Unique ID for React keys
  serialNo: number; // For 1, 2, 3 sequence
  regnNo: string;
  dateOfRegn: string;
  regnValidity: string;
  ownerSerial: string;
  chassisNo: string;
  engineMotorNo: string;
  ownerName: string;
  relativeName: string; // Son/Wife/Daughter
  ownership: string;
  address: string;
  fuel: string;
  emissionNorms: string;
  vehicleClass: string;
  makerName: string;
  modelName: string;
  colorBodyType: string;
  seatingCapacity: string;
  unladenLadenWeight: string;
  cubicCap: string;
  financier: string;
  horsePower: string;
  wheelBase: string;
  mfgMonthYear: string;
  noOfCylinders: string;
  regAuthority: string;
  remarks: string; // Voice note column
  entryBy: string; // Which user added this
  timestamp: string;
  isSynced?: boolean; // Track if this row has been sent to Sheet
  
  // --- New Registry Fields ---
  registerName?: string; // e.g., "Inward", "Outward", "Objection"
  fileStatus?: string;   // e.g., "Pending", "Approved", "Rejected"
  workDate?: string;     // Date of the status update
  assignedTo?: string;   // User to whom the work is assigned
  dueDate?: string;      // Deadline Date
  dueTime?: string;      // New: Deadline Time

  // --- New Extended Fields (Transfer/Contact) ---
  mobileNo?: string;
  transferName?: string;        // New Owner Name
  transferFatherName?: string;  // New Owner Father Name
  transferAddress?: string;     // New Address
  transferAadhaarNo?: string;   // New: Aadhaar Number
}

export interface User {
  id: string;
  username: string;
  password?: string; // For login
  role: 'ADMIN' | 'USER';
  name: string;
  address?: string; // New field for user management
  mobile?: string; // New: Staff mobile number for WhatsApp notifications
  canExport?: boolean; // Permission to access Master Sheet, Sync Setup, and Export
}

export enum AppStatus {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
}