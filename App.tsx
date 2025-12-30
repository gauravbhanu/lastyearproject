import React, { useState, useEffect, useRef } from 'react';
import { AppStatus, User, VehicleData } from './types';
import { USERS, APP_TITLE_ENGLISH, APP_TITLE_HINDI, TABLE_HEADERS, APPS_SCRIPT_CODE, DEFAULT_FILE_STATUSES } from './constants';
import { extractVehicleData, extractAadhaarData } from './services/geminiService';

// Extracted from the provided URL in the prompt
const SPREADSHEET_OPEN_URL = "https://docs.google.com/spreadsheets/d/1R6Z3MncMLKu2xpm_XRBI_yCz60_4ejyRAr5YabRrPT4/edit";

// --- Background Images ---
const LOGIN_BG_URL = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop"; 
const DASHBOARD_BG_URL = "https://images.unsplash.com/photo-1542395975-d6d3dd0619c0?q=80&w=2069&auto=format&fit=crop"; 

// --- Icons ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);
const MicIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${active ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);
const ExcelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
const CogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.43.057.92.115 1.57.172.637.78.341 1.285.341 1.91 0 2.52.56 2.52 1.27 0 .58-.45 1.07-1.14 1.34-1.25.49-1.99.78-2.67 1.27-.47.33-.87.82-1.13 1.4-1.25.68-.42.92-.85.92-1.34 0-.85-.56-1.46-1.27-1.46-.5 0-.96.22-1.28.56-.27.28-.42-.66.42-1.07 0-.68-.56-1.27-1.27-1.27z" />
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-teal-500">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);
const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
);
const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);
const GearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.43.057.92.115 1.57.172.637.78.341 1.285.341 1.91 0 2.52.56 2.52 1.27 0 .58-.45 1.07-1.14 1.34-1.25.49-1.99.78-2.67 1.27-.47.33-.87.82-1.13 1.4-1.25.68-.42.92-.85.92-1.34 0-.85-.56-1.46-1.27-1.46-.5 0-.96.22-1.28.56-.27.28-.42-.66.42-1.07 0-.68-.56-1.27-1.27-1.27z" />
  </svg>
);


// --- Speech Recognition Setup ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

// --- Helper: Dynamic Script Loader for XLSX ---
const loadXLSX = (): Promise<any> => { // eslint-disable-line @typescript-eslint/no-explicit-any
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).XLSX) {
      resolve((window as any).XLSX);
      return;
    }
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve((window as any).XLSX);
    script.onerror = () => reject(new Error("Failed to load XLSX library"));
    document.head.appendChild(script);
  });
};

// --- Helper: Client-Side Image Resizer (Speeds up upload) ---
const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          // Cap max dimension to 1024px to speed up Gemini processing
          const MAX_DIM = 1024;

          if (width > height) {
            if (width > MAX_DIM) {
              height *= MAX_DIM / width;
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width *= MAX_DIM / height;
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Get base64 string (compress to 70% quality JPEG)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
          resolve(dataUrl.split(',')[1]);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
};

// --- Mobile Card Component Definition ---
interface MobileCardProps {
  item: VehicleData;
  onSelect: (item: VehicleData) => void;
  onStatusUpdate: (item: VehicleData) => void;
  onWhatsApp: (item: VehicleData) => void;
}

const MobileCard: React.FC<MobileCardProps> = ({ item, onSelect, onStatusUpdate, onWhatsApp }) => (
  <div 
    className="relative bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 mb-4 active:scale-[0.98] transition-all cursor-pointer overflow-hidden group"
  >
    {/* Action Area (Clicking here opens Detail View) */}
    <div onClick={() => onSelect(item)}>
        {/* Decorative gradient blob */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-teal-50 rounded-full blur-xl -mr-10 -mt-10 opacity-60"></div>

        <div className="relative z-10 flex justify-between items-start mb-3">
        <div>
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-1">{item.regnNo || "NA"}</h3>
            <p className="text-sm font-semibold text-gray-600 flex items-center gap-1">
            <UserIcon />
            {item.ownerName || "Unknown Owner"}
            </p>
        </div>
        <div className="flex flex-col items-end">
            {item.isSynced ? <CheckIcon /> : <span className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></span>}
            <span className="text-[10px] text-gray-400 mt-1 font-mono">{item.timestamp.split(',')[0]}</span>
        </div>
        </div>
        
        <div className="relative z-10 grid grid-cols-2 gap-3 text-xs text-gray-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <div>
            <span className="block text-gray-400 uppercase text-[10px] tracking-wider">Model</span>
            <span className="font-bold text-slate-700 truncate block">{item.modelName || 'N/A'}</span>
        </div>
        <div>
            <span className="block text-gray-400 uppercase text-[10px] tracking-wider">Class</span>
            <span className="font-bold text-slate-700 truncate block">{item.vehicleClass || 'N/A'}</span>
        </div>
        </div>
    </div>
    
    {/* Registry Status Badge / Action */}
    <div className="relative z-10 mt-3 flex flex-wrap justify-between items-center bg-slate-50 border-t border-slate-100 pt-3 gap-2">
        <div className="flex flex-col gap-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                {item.fileStatus ? (
                    <span className={`px-2 py-1 rounded bg-blue-100 text-blue-700`}>{item.fileStatus}</span>
                ) : (
                    <span className="text-slate-300">No Status</span>
                )}
                {item.registerName && <span className="text-slate-400">in {item.registerName}</span>}
            </div>
             {item.assignedTo && (
                <div className="flex items-center gap-2 mt-1">
                   <div className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded w-fit">
                        Assigned to: {item.assignedTo}
                   </div>
                   {item.dueDate && (
                       <div className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-1 rounded w-fit border border-red-100">
                           Due: {item.dueDate} {item.dueTime}
                       </div>
                   )}
                </div>
            )}
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onWhatsApp(item);
                }}
                className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors shrink-0"
            >
                <WhatsAppIcon />
            </button>
            <button 
            onClick={(e) => {
                e.stopPropagation();
                onStatusUpdate(item);
            }}
            className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors shrink-0"
            >
                <PlusIcon />
            </button>
        </div>
    </div>
  </div>
);

// --- Component to render Status Configuration List ---
const StatusConfigItem = ({ text, onDelete, bgClass }: { text: string, onDelete: () => void, bgClass: string }) => (
    <div className={`${bgClass} flex items-center justify-between px-4 py-3 rounded-md mb-2 shadow-sm border border-black/10`}>
        <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">{text}</span>
        <div className="flex items-center gap-2">
            {/* Using generic Edit icon for visual consistency with prompt, though functionality is mainly delete for simplification or inline edit */}
            <span className="text-slate-400"><EditIcon /></span> 
            <button onClick={onDelete} className="text-slate-500 hover:text-red-600"><DeleteIcon /></button>
        </div>
    </div>
);


export default function App() {
  // State
  const [status, setStatus] = useState<AppStatus>(AppStatus.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  // Data State
  const [data, setData] = useState<VehicleData[]>([]);
  const [users, setUsers] = useState<User[]>(USERS); 
  const [scriptUrl, setScriptUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(1); 
  const [searchTerm, setSearchTerm] = useState(''); 
  
  // Registers State (Dynamic)
  const [registers, setRegisters] = useState<string[]>(["General Register", "Inward Register", "Outward Register", "Objection Register", "Dispatch Register"]);
  // File Status State (Dynamic) - initialized with user requested defaults
  const [fileStatuses, setFileStatuses] = useState<string[]>(DEFAULT_FILE_STATUSES);

  // UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [aadhaarProcessing, setAadhaarProcessing] = useState(false); // New state for Aadhaar scan
  const [statusMessage, setStatusMessage] = useState<React.ReactNode>(''); 
  const [voiceText, setVoiceText] = useState(''); // General voice text (can be pre-fill)
  const [isListening, setIsListening] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [showStatusConfigModal, setShowStatusConfigModal] = useState(false); // New: Status Config Modal
  const [editingStatusList, setEditingStatusList] = useState<string[]>([]); // New: Temp status list for editing
  
  // --- New States for Mandatory Remark Flow ---
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [modalRemark, setModalRemark] = useState(''); // Specific remark for the current upload
  const [modalAssignedTo, setModalAssignedTo] = useState(''); // Specific assigned user for current upload
  
  // --- States for Status Update Modal ---
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeVehicleForStatus, setActiveVehicleForStatus] = useState<VehicleData | null>(null);
  const [statusForm, setStatusForm] = useState({
      registerName: '',
      fileStatus: '',
      workDate: '',
      remarks: '',
      assignedTo: '',
      dueDate: '',
      dueTime: '', // New Field
      // Extended Fields
      mobileNo: '',
      transferName: '',
      transferFatherName: '',
      transferAddress: '',
      transferAadhaarNo: '' 
  });
  
  // Mobile Detail View State
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);

  // Admin Form State
  const [userForm, setUserForm] = useState<Partial<User>>({});
  const [isEditingUser, setIsEditingUser] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null); // New Ref for Aadhaar
  const micRef = useRef<any>(null); 

  // --- Initialization ---
  useEffect(() => {
    const storedData = localStorage.getItem('yatayat_data');
    if (storedData) {
      try {
        setData(JSON.parse(storedData));
      } catch (e) { console.error("Failed to load local data"); }
    }

    const storedUsers = localStorage.getItem('yatayat_users');
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (e) { console.error("Failed to load users"); }
    } else {
        setUsers(USERS);
    }

    const storedRegisters = localStorage.getItem('yatayat_registers');
    if (storedRegisters) {
        try {
            setRegisters(JSON.parse(storedRegisters));
        } catch(e) { console.error("Failed to load registers"); }
    }
    
    const storedStatuses = localStorage.getItem('yatayat_statuses');
    if (storedStatuses) {
        try {
            setFileStatuses(JSON.parse(storedStatuses));
        } catch(e) { 
            console.error("Failed to load file statuses"); 
            setFileStatuses(DEFAULT_FILE_STATUSES);
        }
    } else {
        setFileStatuses(DEFAULT_FILE_STATUSES);
    }

    const storedUrl = localStorage.getItem('yatayat_script_url');
    if (storedUrl) setScriptUrl(storedUrl);
  }, []);

  useEffect(() => {
    if (data.length > 0) localStorage.setItem('yatayat_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
     localStorage.setItem('yatayat_users', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
      localStorage.setItem('yatayat_registers', JSON.stringify(registers));
  }, [registers]);
  
  useEffect(() => {
      localStorage.setItem('yatayat_statuses', JSON.stringify(fileStatuses));
  }, [fileStatuses]);

  useEffect(() => {
    if (scriptUrl) localStorage.setItem('yatayat_script_url', scriptUrl);
  }, [scriptUrl]);

  // --- Auth Logic ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginInput && (u.password === passwordInput || (!u.password && passwordInput === '12345')));
    
    if (user) {
      setCurrentUser(user);
      setStatus(AppStatus.DASHBOARD);
      setLoginInput('');
      setPasswordInput('');
    } else {
      alert("Invalid User ID or Password.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStatus(AppStatus.LOGIN);
    setShowAdminPanel(false);
    setSearchTerm('');
  };

  // --- User Management Logic ---
  const openUserModal = (user?: User) => {
      if (user) {
          setUserForm({ ...user });
          setIsEditingUser(true);
      } else {
          setUserForm({ role: 'USER', canExport: false, password: '' });
          setIsEditingUser(false);
      }
      setShowUserModal(true);
  };

  const handleSaveUser = () => {
      if (!userForm.name || !userForm.username) {
          alert("Name and User ID are required");
          return;
      }

      if (isEditingUser) {
          setUsers(prev => prev.map(u => u.id === userForm.id ? { ...u, ...userForm } as User : u));
      } else {
          if (users.some(u => u.username === userForm.username)) {
              alert("User ID already exists!");
              return;
          }
          const newUser: User = {
              id: Date.now().toString(),
              name: userForm.name || '',
              username: userForm.username || '',
              password: userForm.password || '12345',
              role: userForm.role || 'USER',
              address: userForm.address || '',
              mobile: userForm.mobile || '',
              canExport: userForm.canExport || false
          };
          setUsers(prev => [...prev, newUser]);
      }
      setShowUserModal(false);
  };

  const handleDeleteUser = (id: string) => {
      if (window.confirm("Are you sure you want to delete this user?")) {
          setUsers(prev => prev.filter(u => u.id !== id));
      }
  };

  // --- Status Configuration Logic ---
  const openStatusConfig = () => {
      setEditingStatusList([...fileStatuses]);
      setShowStatusConfigModal(true);
  };

  const handleSaveStatusConfig = () => {
      setFileStatuses(editingStatusList);
      setShowStatusConfigModal(false);
  };

  const handleDeleteStatusItem = (index: number) => {
      const newList = [...editingStatusList];
      newList.splice(index, 1);
      setEditingStatusList(newList);
  };

  const handleAddStatusItem = () => {
      const newName = prompt("Enter new status name:");
      if (newName) {
          setEditingStatusList([...editingStatusList, newName.toUpperCase()]);
      }
  };

  // Helper to determine background color for config list to match user request styles roughly
  const getStatusBgClass = (statusName: string, index: number) => {
      const name = statusName.toUpperCase();
      if (name.includes("RTO WORK IN PROGRESS")) return "bg-black text-white";
      if (name.includes("APPROVED")) return "bg-yellow-300";
      if (name.includes("PENDING")) return "bg-red-400 text-white";
      if (name.includes("COMPLETE")) return "bg-green-200";
      // Fallback alternating colors or simple gray
      return index % 2 === 0 ? "bg-slate-100" : "bg-white";
  };


  // --- Status/Register Management Logic ---
  const openStatusModal = (vehicle: VehicleData) => {
      setActiveVehicleForStatus(vehicle);
      setStatusForm({
          registerName: vehicle.registerName || registers[0],
          fileStatus: vehicle.fileStatus || fileStatuses[0],
          workDate: vehicle.workDate || new Date().toISOString().split('T')[0],
          remarks: vehicle.remarks || '',
          assignedTo: vehicle.assignedTo || '',
          dueDate: vehicle.dueDate || '',
          dueTime: vehicle.dueTime || '',
          // New fields
          mobileNo: vehicle.mobileNo || '',
          transferName: vehicle.transferName || '',
          transferFatherName: vehicle.transferFatherName || '',
          transferAddress: vehicle.transferAddress || '',
          transferAadhaarNo: vehicle.transferAadhaarNo || ''
      });
      setShowStatusModal(true);
  };

  const handleSaveStatus = async () => {
      if (!activeVehicleForStatus) return;

      // Update Dynamic Registers/Statuses List if new ones are typed
      if (statusForm.registerName && !registers.includes(statusForm.registerName)) {
          setRegisters(prev => [...prev, statusForm.registerName]);
      }
      if (statusForm.fileStatus && !fileStatuses.includes(statusForm.fileStatus)) {
          setFileStatuses(prev => [...prev, statusForm.fileStatus]);
      }

      // Update Local Data
      const updatedData = data.map(v => 
          v.id === activeVehicleForStatus.id 
          ? { 
              ...v, 
              ...statusForm,
              isSynced: false // Mark as unsynced so changes are pushed to sheet
            }
          : v
      );
      setData(updatedData);
      
      // Update the active detail view if open
      if (selectedVehicle && selectedVehicle.id === activeVehicleForStatus.id) {
          setSelectedVehicle({ ...selectedVehicle, ...statusForm, isSynced: false });
      }

      setShowStatusModal(false);
      
      // Optional: Auto-sync confirmation
      if(window.confirm("Status updated locally. Do you want to sync this change to the Sheet now?")) {
         const itemToSync = updatedData.find(v => v.id === activeVehicleForStatus.id);
         if(itemToSync) {
             setIsProcessing(true);
             await syncToSheet([itemToSync], true); // Silent sync
             setIsProcessing(false);
             alert("Synced successfully!");
         }
      }
  };

  // --- Aadhaar Scan Logic (Updated for Multiple Images) ---
  const handleAadhaarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setAadhaarProcessing(true);
    try {
        const fileArray = Array.from(files);
        // Process all selected images
        const processedImages = await Promise.all(fileArray.map(async (file) => {
             let base64Content = "";
             const mimeType = file.type;
             if (mimeType.startsWith('image/')) {
                base64Content = await resizeImage(file);
             } else {
                 throw new Error("Only images are supported for Aadhaar scan");
             }
             return { 
                 base64: base64Content, 
                 mimeType: mimeType.startsWith('image/') ? 'image/jpeg' : mimeType 
             };
        }));

        const extracted = await extractAadhaarData(processedImages);
        
        setStatusForm(prev => ({
            ...prev,
            transferName: extracted.name || prev.transferName,
            transferFatherName: extracted.fatherName || prev.transferFatherName,
            transferAddress: extracted.address || prev.transferAddress,
            transferAadhaarNo: extracted.aadhaarNo || prev.transferAadhaarNo
        }));

    } catch (error) {
        console.error("Aadhaar Scan Error:", error);
        alert("Failed to extract Aadhaar details. Please ensure you uploaded images.");
    } finally {
        setAadhaarProcessing(false);
        if (aadhaarInputRef.current) aadhaarInputRef.current.value = "";
    }
  };

  // --- WhatsApp Logic (Client) ---
  const handleWhatsApp = (vehicle: VehicleData) => {
      // 1. Check if Status is 'FILE APPROVED IN RTO OFFICE' - Block reminder if true
      if (vehicle.fileStatus === "FILE APPROVED IN RTO OFFICE") {
          alert("File is approved in RTO Office. No reminder needed.");
          return;
      }

      const phone = vehicle.mobileNo || ""; 
      
      // 2. Construct single vehicle message using the requested Hindi template
      // Only one item in the list
      const itemText = `1️⃣ ${vehicle.regnNo || 'NA'} - ${vehicle.ownerName || 'Unknown'} - ${vehicle.fileStatus || 'Pending'}`;
      const due = `${vehicle.dueDate || ''} ${vehicle.dueTime || ''}`.trim() || 'ASAP';

      const message = `📌 लंबित कार्य की याद दिलाने हेतु
नमस्कार 🙏
आपको यह संदेश आपके लंबित कार्यों की याद दिलाने के लिए भेजा जा रहा है।
कृपया नीचे दिए गए कार्यों को प्राथमिकता के आधार पर जल्द से जल्द पूरा करें:
${itemText}
🕘 समय सीमा: ${due}
यदि किसी कार्य में समस्या आ रही है तो तुरंत सूचित करें।
कार्य पूर्ण होते ही Done/Completed लिखकर रिप्लाई करें।
धन्यवाद
— टीम ${APP_TITLE_HINDI}`;

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  // --- WhatsApp Staff Reminder Logic (Updated Template with Time) ---
  const handleStaffReminder = (username: string, pendingItems: VehicleData[]) => {
      const staffUser = users.find(u => u.username === username);
      if (!staffUser || !staffUser.mobile) {
          alert("User mobile number not found! Please update it in User Management.");
          return;
      }
      
      // Filter out 'FILE APPROVED IN RTO OFFICE' items from reminders? 
      // The prompt said "due date or reminder nahi karna he". 
      // It's safer to exclude them from the staff summary too if they are considered "done" in this context.
      const activePendingItems = pendingItems.filter(item => item.fileStatus !== "FILE APPROVED IN RTO OFFICE");

      if (activePendingItems.length === 0) {
          alert("No pending tasks requiring reminders (some might be Approved).");
          return;
      }

      // Construct list of tasks for the template
      const tasks = activePendingItems.slice(0, 3).map((item, index) => {
          const work = item.fileStatus || 'Pending';
          const lastAction = item.remarks ? `(Last Action: ${item.remarks})` : '';
          return `${index + 1}️⃣ ${item.regnNo} - ${item.ownerName || 'Unknown'} - ${work} ${lastAction}`;
      }).join('\n');

      let taskString = tasks;
      // Find earliest due date and time
      const itemsWithDue = activePendingItems.filter(i => i.dueDate);
      itemsWithDue.sort((a, b) => {
          const dateA = new Date(`${a.dueDate} ${a.dueTime || '00:00'}`);
          const dateB = new Date(`${b.dueDate} ${b.dueTime || '00:00'}`);
          return dateA.getTime() - dateB.getTime();
      });

      const earliestItem = itemsWithDue[0];
      const earliestDueStr = earliestItem 
          ? `${earliestItem.dueDate} ${earliestItem.dueTime || ''}`.trim()
          : 'ASAP';
      
      const message = `📌 लंबित कार्य की याद दिलाने हेतु
नमस्कार 🙏
आपको यह संदेश आपके लंबित कार्यों की याद दिलाने के लिए भेजा जा रहा है।
कृपया नीचे दिए गए कार्यों को प्राथमिकता के आधार पर जल्द से जल्द पूरा करें:
${taskString}
🕘 समय सीमा: ${earliestDueStr}
यदि किसी कार्य में समस्या आ रही है तो तुरंत सूचित करें।
कार्य पूर्ण होते ही Done/Completed लिखकर रिप्लाई करें।
धन्यवाद
— टीम ${APP_TITLE_HINDI}`;

      const url = `https://wa.me/${staffUser.mobile}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  // --- Notification Logic ---
  const isPending = (status?: string) => {
      return status !== 'Completed' && status !== 'Dispatched' && status !== 'Rejected';
  }

  // Admin sees grouped by user, User sees their own
  const myPendingItems = data.filter(d => 
      d.assignedTo === currentUser?.username && isPending(d.fileStatus)
  );

  // Grouping logic for Admin
  const adminPendingGroups: Record<string, VehicleData[]> = {};
  if (currentUser?.role === 'ADMIN') {
      data.forEach(item => {
          if (item.assignedTo && isPending(item.fileStatus)) {
              if (!adminPendingGroups[item.assignedTo]) {
                  adminPendingGroups[item.assignedTo] = [];
              }
              adminPendingGroups[item.assignedTo].push(item);
          }
      });
  }

  const notificationCount = currentUser?.role === 'ADMIN' 
      ? Object.keys(adminPendingGroups).length // Count of staff with pending work
      : myPendingItems.length; // Count of individual tasks


  // --- Voice Logic (Generic) ---
  const toggleMic = (targetSetter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!SpeechRecognition) {
      alert("Browser does not support Speech Recognition. Use Chrome.");
      return;
    }

    if (isListening) {
      micRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage("Listening...");
      };

      recognition.onresult = (event: any) => { 
        const transcript = event.results[0][0].transcript;
        targetSetter((prev) => {
            const cleanTranscript = transcript.trim();
            if (!prev) return cleanTranscript;
            return `${prev} ${cleanTranscript}`;
        });
        setStatusMessage("Voice captured.");
      };

      recognition.onerror = (event: any) => { 
        console.error("Speech error", event.error);
        setIsListening(false);
        setStatusMessage("");
      };

      recognition.onend = () => {
        setIsListening(false);
        if (statusMessage === "Listening...") setStatusMessage("");
      };

      micRef.current = recognition;
      recognition.start();
    }
  };

  // --- Voice Logic for Object State (Status Modal) ---
  const toggleMicForStatus = () => {
      if (!SpeechRecognition) {
          alert("Browser does not support Speech Recognition.");
          return;
      }
      if (isListening) {
          micRef.current?.stop();
          setIsListening(false);
      } else {
          const recognition = new SpeechRecognition();
          recognition.lang = 'en-IN';
          recognition.onstart = () => { setIsListening(true); setStatusMessage("Listening..."); };
          recognition.onresult = (e: any) => {
              const text = e.results[0][0].transcript;
              setStatusForm(prev => ({ ...prev, remarks: prev.remarks ? `${prev.remarks} ${text}` : text }));
          };
          recognition.onend = () => { setIsListening(false); setStatusMessage(""); };
          micRef.current = recognition;
          recognition.start();
      }
  };

  // --- File Processing Logic ---
  const normalize = (str: string) => str ? str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : '';

  const smartMerge = (oldData: any, newData: any, timestamp: string) => {
    const result = { ...oldData };
    Object.keys(newData).forEach((key) => {
      const newVal = newData[key];
      const oldVal = oldData[key];
      if (newVal && newVal !== "NA" && newVal !== "N/A") {
        if (!oldVal || oldVal === "NA" || oldVal === "N/A" || oldVal === "") {
          result[key] = newVal;
        }
      }
    });
    result.timestamp = timestamp;
    return result;
  };

  const syncToSheet = async (itemsToSync: VehicleData[], silent: boolean = false) => {
    if (!scriptUrl) {
      if (!silent) setShowSetupModal(true);
      return;
    }
    
    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(itemsToSync)
      });
      
      const jsonResponse = await response.json();
      
      if (jsonResponse.status === 'success') {
        const syncedIds = new Set(itemsToSync.map(i => i.id));
        setData(prevData => prevData.map(item => 
          syncedIds.has(item.id) ? { ...item, isSynced: true } : item
        ));
        
        setStatusMessage("Data synced to Sheet.");
        
        if (jsonResponse.duplicateRows > 0) {
            if(!silent) alert("Duplicate entry updated/found in sheet.");
        } else if (!silent) {
            alert("Request sent successfully. Please check your Google Sheet.");
        }
      } else {
        throw new Error(jsonResponse.message || "Unknown error");
      }

    } catch (error) {
      console.error("Sync Error:", error);
      setStatusMessage("Sync failed. Check connection.");
      if (!silent) alert("Failed to receive confirmation from sheet.");
    }
  };
  
  const handleManualSync = async () => {
    if (!scriptUrl) {
      alert("Please configure the Google Apps Script URL in 'Setup Sync' first.");
      setShowSetupModal(true);
      return;
    }

    const unsyncedData = data.filter(item => !item.isSynced);
    if (unsyncedData.length === 0) {
      alert("All data is already synced to the sheet.");
      return;
    }

    if (window.confirm("Are you sure that a data save message should appear?")) {
       setIsProcessing(true);
       await syncToSheet(unsyncedData, false); 
       setIsProcessing(false);
    }
  };

  // 1. Initial Selection: Just opens the modal
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Store files to be processed
    setPendingFiles(Array.from(files));
    // Pre-fill modal remark with whatever was typed in the dashboard (optional convenience)
    setModalRemark(voiceText);
    setModalAssignedTo(""); // Clear previous assignment
    // Show the modal
    setShowRemarkModal(true);
    
    // Reset inputs so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // 2. Actual Processing: Triggered by the Modal "Confirm" button
  const handleProcessFiles = async () => {
    setShowRemarkModal(false); // Close modal
    setIsProcessing(true);
    
    const fileList = pendingFiles;
    const currentBatchRemark = modalRemark; // Capture the remark from the modal
    const currentBatchAssignedTo = modalAssignedTo; // Capture assigned user

    setStatusMessage(`Processing ${fileList.length} files...`);

    const promises = fileList.map(async (file) => {
        try {
            let base64Content = "";
            const mimeType = file.type;
            
            if (mimeType.startsWith('image/')) {
                base64Content = await resizeImage(file);
            } else {
                base64Content = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
                    reader.readAsDataURL(file);
                });
            }
            
            const payloadMime = mimeType.startsWith('image/') ? 'image/jpeg' : mimeType;
            const extracted = await extractVehicleData(base64Content, payloadMime);
            
            setData(prevData => {
                const batchTimestamp = new Date().toLocaleString();
                const extractedRegnNo = extracted.regnNo || "";
                const normalizedRegn = normalize(extractedRegnNo);
                
                const existingIndex = prevData.findIndex(d => 
                  normalize(d.regnNo) === normalizedRegn && 
                  extractedRegnNo !== "NA" && extractedRegnNo !== ""
                );
                
                if (existingIndex >= 0) {
                     const existingRow = prevData[existingIndex];
                     const mergedFields = smartMerge(existingRow, extracted, batchTimestamp);
                     const updatedRow = {
                        ...existingRow,
                        ...mergedFields,
                        remarks: currentBatchRemark || existingRow.remarks, // Use the modal remark
                        entryBy: currentUser?.username || existingRow.entryBy,
                        assignedTo: currentBatchAssignedTo || existingRow.assignedTo, // Use modal assignedTo
                        isSynced: false
                     };
                     const newData = [...prevData];
                     newData[existingIndex] = updatedRow;
                     return newData;
                } else {
                     const newRow: VehicleData = {
                        id: Date.now().toString() + Math.random().toString(),
                        serialNo: prevData.length + 1,
                        regnNo: extracted.regnNo || "NA",
                        dateOfRegn: extracted.dateOfRegn || "NA",
                        regnValidity: extracted.regnValidity || "NA",
                        ownerSerial: extracted.ownerSerial || "NA",
                        chassisNo: extracted.chassisNo || "NA",
                        engineMotorNo: extracted.engineMotorNo || "NA",
                        ownerName: extracted.ownerName || "NA",
                        relativeName: extracted.relativeName || "NA",
                        ownership: extracted.ownership || "NA",
                        address: extracted.address || "NA",
                        fuel: extracted.fuel || "NA",
                        emissionNorms: extracted.emissionNorms || "NA",
                        vehicleClass: extracted.vehicleClass || "NA",
                        makerName: extracted.makerName || "NA",
                        modelName: extracted.modelName || "NA",
                        colorBodyType: extracted.colorBodyType || "NA",
                        seatingCapacity: extracted.seatingCapacity || "NA",
                        unladenLadenWeight: extracted.unladenLadenWeight || "NA",
                        cubicCap: extracted.cubicCap || "NA",
                        financier: extracted.financier || "NA",
                        horsePower: extracted.horsePower || "NA",
                        wheelBase: extracted.wheelBase || "NA",
                        mfgMonthYear: extracted.mfgMonthYear || "NA",
                        noOfCylinders: extracted.noOfCylinders || "NA",
                        regAuthority: extracted.regAuthority || "NA",
                        remarks: currentBatchRemark, // Use the modal remark
                        entryBy: currentUser?.username || "Unknown",
                        timestamp: batchTimestamp,
                        isSynced: false,
                        
                        // Defaults for new row
                        registerName: registers[0],
                        fileStatus: "New", // Default from requested list
                        workDate: new Date().toISOString().split('T')[0],
                        assignedTo: currentBatchAssignedTo || "" // Use modal assignedTo
                     };
                     return [newRow, ...prevData];
                }
            });

        } catch (error) {
            console.error("Error processing file:", file.name, error);
        }
    });

    await Promise.all(promises);

    setIsProcessing(false);
    setVoiceText(""); // Clear global voice text
    setModalRemark(""); // Clear modal remark
    setModalAssignedTo(""); // Clear modal assignedTo
    setPendingFiles([]); // Clear pending
    setStatusMessage("Processing complete. Click Manual Sync to save to Sheet.");
  };

  const handleExport = async () => {
    if (data.length === 0) return;
    setIsProcessing(true);
    setStatusMessage("Preparing Excel file...");
    try {
      const XLSX = await loadXLSX();
      const ws_data = data.map(item => [
        item.serialNo, item.regnNo, item.dateOfRegn, item.regnValidity, item.ownerSerial,
        item.chassisNo, item.engineMotorNo, item.ownerName, item.relativeName, item.ownership,
        item.address, item.fuel, item.emissionNorms, item.vehicleClass, item.makerName,
        item.modelName, item.colorBodyType, item.seatingCapacity, item.unladenLadenWeight,
        item.cubicCap, item.financier, item.horsePower, item.wheelBase, item.mfgMonthYear,
        item.noOfCylinders, item.regAuthority, item.remarks,
        item.registerName, item.fileStatus, item.workDate, item.dueDate, item.dueTime,
        item.assignedTo, item.entryBy, item.mobileNo, item.transferName, item.transferFatherName, item.transferAddress, item.transferAadhaarNo, item.timestamp
      ]);
      ws_data.unshift(TABLE_HEADERS);
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      XLSX.utils.book_append_sheet(wb, ws, "RC Data");
      XLSX.writeFile(wb, "Yatayat_Data.xlsx");
      setStatusMessage("Excel file downloaded.");
    } catch (error) {
      console.error("Export Error:", error);
      setStatusMessage("Export failed.");
      alert("Failed to generate Excel file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const canExport = isAdmin || currentUser?.canExport;

  // Filter Data based on Role
  const roleFilteredData = isAdmin 
    ? data 
    : data.filter(d => d.assignedTo === currentUser?.username || d.entryBy === currentUser?.username);

  const filteredData = roleFilteredData.filter(item => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(lowerTerm)
    );
  });

  const ITEMS_PER_PAGE = 10;
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const displayedData = isAdmin 
    ? filteredData 
    : filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // --- Rendering Helpers ---

  if (status === AppStatus.LOGIN) {
    return (
      <div 
        className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white p-4"
        style={{ backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.7), rgba(17, 24, 39, 0.8)), url(${LOGIN_BG_URL})` }}
      >
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-8 text-center shadow-lg">
            <h1 className="text-2xl font-black text-white tracking-wide drop-shadow-sm">{APP_TITLE_HINDI}</h1>
            <p className="text-xs font-bold text-blue-100 mt-1 uppercase tracking-[0.2em]">{APP_TITLE_ENGLISH}</p>
          </div>
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6 text-center text-white/90">Welcome Back</h2>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">User ID</label>
                <input 
                  type="text" 
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Enter User ID" 
                  className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Password</label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter Password"
                  className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                />
              </div>
              <button 
                type="submit" 
                className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
        className="flex flex-col h-screen bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${DASHBOARD_BG_URL})` }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] pointer-events-none z-0"></div>
      
      {/* --- MODALS --- */}

      {/* 7. STATUS CONFIGURATION MODAL (New) */}
      {showStatusConfigModal && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[80] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-scale-in flex flex-col max-h-[85vh]">
                   <div className="bg-white p-5 border-b border-slate-200 flex justify-between items-center">
                       <h3 className="text-xl font-black text-slate-800 text-blue-900">Configure Statuses</h3>
                       <button onClick={() => setShowStatusConfigModal(false)} className="text-slate-400 hover:text-slate-600"><CloseIcon /></button>
                   </div>
                   
                   <div className="p-4 bg-blue-50/50 flex-1 overflow-y-auto">
                        <div className="space-y-1">
                            {editingStatusList.map((st, i) => (
                                <StatusConfigItem 
                                    key={i} 
                                    text={st} 
                                    onDelete={() => handleDeleteStatusItem(i)} 
                                    bgClass={getStatusBgClass(st, i)}
                                />
                            ))}
                        </div>
                   </div>

                   <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                        <button 
                            onClick={handleAddStatusItem}
                            className="w-full py-3 bg-blue-600/90 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <PlusIcon /> Add New Status
                        </button>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowStatusConfigModal(false)}
                                className="flex-1 py-3 bg-white border border-red-200 text-red-500 font-bold rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveStatusConfig}
                                className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-md"
                            >
                                Submit
                            </button>
                        </div>
                   </div>
              </div>
          </div>
      )}
      
      {/* 5. STATUS UPDATE / REGISTRY MODAL (Updated with Editable Fields & Assign User) */}
      {showStatusModal && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[70] flex items-end sm:items-center justify-center sm:p-4">
              <div className="bg-white w-full sm:w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 text-white shrink-0">
                      <h3 className="text-xl font-black">Update Status & Assign</h3>
                      <p className="text-purple-100 text-sm">Track file movement and assign tasks.</p>
                  </div>
                  
                  <div className="p-6 bg-slate-50 flex-1 space-y-4 overflow-y-auto">
                      
                      {/* Register Name (Editable) */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                              Select Register
                          </label>
                          <input 
                            list="register-list"
                            value={statusForm.registerName}
                            onChange={(e) => setStatusForm({...statusForm, registerName: e.target.value})}
                            className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
                            placeholder="Type to add new..."
                          />
                          <datalist id="register-list">
                              {registers.map((reg, i) => (
                                  <option key={i} value={reg} />
                              ))}
                          </datalist>
                      </div>
                      
                      {/* Dates Row with Time */}
                      <div className="flex gap-3">
                          <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                                 Work Date
                              </label>
                              <input 
                                  type="date"
                                  value={statusForm.workDate}
                                  onChange={(e) => setStatusForm({...statusForm, workDate: e.target.value})}
                                  className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
                              />
                          </div>
                          <div className="flex-[1.5] flex gap-2">
                             <div className="flex-1">
                                  <label className="block text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
                                     Due Date
                                  </label>
                                  <input 
                                      type="date"
                                      value={statusForm.dueDate}
                                      onChange={(e) => setStatusForm({...statusForm, dueDate: e.target.value})}
                                      className="w-full p-3 bg-white border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-800"
                                  />
                             </div>
                             <div className="w-24">
                                  <label className="block text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
                                     Time
                                  </label>
                                  <input 
                                      type="time"
                                      value={statusForm.dueTime}
                                      onChange={(e) => setStatusForm({...statusForm, dueTime: e.target.value})}
                                      className="w-full p-3 bg-white border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-slate-800"
                                  />
                             </div>
                          </div>
                      </div>
                      
                      {/* File Status (Dropdown Select with Config Button) */}
                      <div>
                          <div className="flex justify-between items-end mb-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                                File Status
                            </label>
                            <button 
                                onClick={openStatusConfig} 
                                className="text-[10px] flex items-center gap-1 text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
                            >
                                <GearIcon /> Configure
                            </button>
                          </div>
                          
                          <select
                              value={statusForm.fileStatus}
                              onChange={(e) => setStatusForm({...statusForm, fileStatus: e.target.value})}
                              className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 appearance-none"
                          >
                              {fileStatuses.map((st, i) => (
                                  <option key={i} value={st}>{st}</option>
                              ))}
                          </select>
                      </div>

                      {/* Assigned To User (New) */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                             Assign To User
                          </label>
                          <input 
                              list="users-list"
                              value={statusForm.assignedTo}
                              onChange={(e) => setStatusForm({...statusForm, assignedTo: e.target.value})}
                              className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
                              placeholder="Select User..."
                          />
                          <datalist id="users-list">
                              {users.map((u) => (
                                  <option key={u.id} value={u.username}>{u.name}</option>
                              ))}
                          </datalist>
                      </div>

                      {/* NEW: Transfer Fields with Aadhaar Auto-Fill */}
                      <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-3 space-y-3">
                           <div className="flex justify-between items-center">
                              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Transfer Details</h4>
                              {/* Hidden Aadhaar Input - Updated for multiple files */}
                              <input type="file" multiple accept="image/*" ref={aadhaarInputRef} onChange={handleAadhaarSelect} className="hidden" />
                              <button 
                                  onClick={() => aadhaarInputRef.current?.click()}
                                  disabled={aadhaarProcessing}
                                  className="flex items-center gap-1 text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-full font-bold shadow hover:bg-blue-700 transition-all"
                              >
                                  {aadhaarProcessing ? (
                                     <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  ) : <CameraIcon />}
                                  Scan Aadhaar
                              </button>
                           </div>
                           
                           <div>
                               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mobile Number</label>
                               <input type="text" value={statusForm.mobileNo} onChange={(e) => setStatusForm({...statusForm, mobileNo: e.target.value})} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" placeholder="Contact No" />
                           </div>
                           <div>
                               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Transfer Name (New Owner)</label>
                               <input type="text" value={statusForm.transferName} onChange={(e) => setStatusForm({...statusForm, transferName: e.target.value})} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" placeholder="New Owner Name" />
                           </div>
                           <div>
                               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Father's Name</label>
                               <input type="text" value={statusForm.transferFatherName} onChange={(e) => setStatusForm({...statusForm, transferFatherName: e.target.value})} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" placeholder="S/o Name" />
                           </div>
                           <div>
                               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">New Address</label>
                               <input type="text" value={statusForm.transferAddress} onChange={(e) => setStatusForm({...statusForm, transferAddress: e.target.value})} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" placeholder="Full Address" />
                           </div>
                           <div>
                               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Aadhaar Number</label>
                               <input type="text" value={statusForm.transferAadhaarNo} onChange={(e) => setStatusForm({...statusForm, transferAadhaarNo: e.target.value})} className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm" placeholder="XXXX XXXX XXXX" />
                           </div>
                      </div>

                      {/* Remarks with Mic */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                             Remark (Update)
                          </label>
                          <div className="relative">
                            <textarea 
                                value={statusForm.remarks}
                                onChange={(e) => setStatusForm({...statusForm, remarks: e.target.value})}
                                placeholder="Add specific note..."
                                className="w-full h-20 p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-800 shadow-inner"
                            />
                            <div className="absolute bottom-2 right-2">
                                <button 
                                    onClick={toggleMicForStatus} 
                                    className={`p-2 rounded-full shadow-md transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                                >
                                    <MicIcon active={isListening} />
                                </button>
                            </div>
                          </div>
                      </div>

                  </div>

                  <div className="p-5 bg-white border-t border-slate-200 flex gap-3 shrink-0">
                      <button 
                          onClick={() => setShowStatusModal(false)}
                          className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveStatus}
                          className="flex-[2] py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all"
                      >
                          Save Update
                      </button>
                  </div>
              </div>
          </div>
      )}


      {/* 4. MANDATORY REMARK POPUP MODAL */}
      {showRemarkModal && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center sm:p-4">
              <div className="bg-white w-full sm:w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-scale-in flex flex-col">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shrink-0">
                      <h3 className="text-xl font-black">Add Details</h3>
                      <p className="text-blue-100 text-sm">You selected {pendingFiles.length} file(s). Please add mandatory details.</p>
                  </div>
                  
                  <div className="p-6 bg-slate-50 flex-1 space-y-4">
                      {/* Assign To User (New in Remark Modal) */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                             Assign To User
                          </label>
                          <input 
                              list="users-list-remark"
                              value={modalAssignedTo}
                              onChange={(e) => setModalAssignedTo(e.target.value)}
                              className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                              placeholder="Select User to Assign..."
                          />
                          <datalist id="users-list-remark">
                              {users.map((u) => (
                                  <option key={u.id} value={u.username}>{u.name}</option>
                              ))}
                          </datalist>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                             Remark (Mandatory)
                          </label>
                          
                          <div className="relative">
                              <textarea 
                                  value={modalRemark}
                                  onChange={(e) => setModalRemark(e.target.value)}
                                  placeholder="Type vehicle condition, location, or notes..."
                                  className="w-full h-32 p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-800 text-lg shadow-inner"
                                  autoFocus
                              />
                              <div className="absolute bottom-3 right-3">
                                   <button 
                                      onClick={() => toggleMic(setModalRemark)} 
                                      className={`p-3 rounded-full shadow-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                                   >
                                      <MicIcon active={isListening} />
                                   </button>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="p-5 bg-white border-t border-slate-200 flex gap-3 shrink-0">
                      <button 
                          onClick={() => {
                              setShowRemarkModal(false);
                              setPendingFiles([]); // Cancel upload
                              if (fileInputRef.current) fileInputRef.current.value = "";
                              if (cameraInputRef.current) cameraInputRef.current.value = "";
                          }}
                          className="flex-1 py-3.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleProcessFiles}
                          className="flex-[2] py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                          <span>Confirm & Upload</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                          </svg>
                      </button>
                  </div>
              </div>
          </div>
      )}
      
      {/* 1. Setup Modal (Script URL) */}
      {showSetupModal && canExport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 flex justify-between items-center">
               <h2 className="text-lg font-bold">Setup Master Sheet Sync</h2>
               <button onClick={() => setShowSetupModal(false)} className="text-white/70 hover:text-white transition-colors bg-white/10 p-1 rounded-full"><CloseIcon /></button>
             </div>
             <div className="p-6 overflow-y-auto flex-1">
               <div className="mb-4">
                 <label className="block text-sm font-bold text-gray-700 mb-2">Paste Web App URL Here:</label>
                 <div className="flex gap-2">
                   <input 
                      type="text" 
                      value={scriptUrl} 
                      onChange={(e) => setScriptUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/..."
                      className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                   <button onClick={() => setShowSetupModal(false)} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-md">Save</button>
                 </div>
               </div>
               <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm">
                 <h3 className="font-bold text-slate-800 mb-3">Instructions:</h3>
                 <textarea readOnly className="w-full h-48 p-4 bg-slate-800 text-teal-300 font-mono text-xs rounded-lg shadow-inner" value={APPS_SCRIPT_CODE} />
                 <button onClick={() => navigator.clipboard.writeText(APPS_SCRIPT_CODE)} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700">Copy Code</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* 2. User Add/Edit Modal */}
      {showUserModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                  <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-800">{isEditingUser ? 'Edit User' : 'Add New User'}</h2>
                      <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600"><CloseIcon /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      {/* User Form Fields (Same as before) */}
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                          <input 
                              type="text" 
                              value={userForm.name || ''} 
                              onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g. John Doe"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Login ID (Username)</label>
                          <input 
                              type="text" 
                              value={userForm.username || ''} 
                              onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g. user1"
                              disabled={isEditingUser && userForm.role === 'ADMIN'} 
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                          <input 
                              type="text" 
                              value={userForm.password || ''} 
                              onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Leave blank to keep existing"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Branch / Address</label>
                          <input 
                              type="text" 
                              value={userForm.address || ''} 
                              onChange={(e) => setUserForm({...userForm, address: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g. Branch 01"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Mobile Number (WhatsApp)</label>
                          <input 
                              type="text" 
                              value={userForm.mobile || ''} 
                              onChange={(e) => setUserForm({...userForm, mobile: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g. 919876543210 (with code)"
                          />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                           <div className="flex items-center gap-2">
                               <input 
                                  type="checkbox" 
                                  id="canExport"
                                  checked={userForm.canExport || false}
                                  onChange={(e) => setUserForm({...userForm, canExport: e.target.checked})}
                                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                               />
                               <label htmlFor="canExport" className="text-sm font-medium text-slate-700 select-none cursor-pointer">Admin Permissions (Export/Sync)</label>
                           </div>
                      </div>
                  </div>
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                      <button onClick={() => setShowUserModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg">Cancel</button>
                      <button onClick={handleSaveUser} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">Save User</button>
                  </div>
              </div>
          </div>
      )}
      
      {/* 6. NOTIFICATIONS PANEL */}
      {showNotificationPanel && (
          <div className="fixed top-16 right-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-[80] overflow-hidden animate-slide-up flex flex-col max-h-[80vh]">
              <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
                  <h3 className="font-bold text-sm">
                      {currentUser?.role === 'ADMIN' ? 'Staff Reminders' : 'Pending Assignments'}
                  </h3>
                  <button onClick={() => setShowNotificationPanel(false)}><CloseIcon /></button>
              </div>
              
              <div className="overflow-y-auto flex-1">
                  {currentUser?.role === 'ADMIN' ? (
                      // ADMIN VIEW: List of Staff with Pending Items
                      Object.keys(adminPendingGroups).length === 0 ? (
                           <div className="p-8 text-center text-slate-500 text-sm">No pending tasks assigned.</div>
                      ) : (
                          <div className="divide-y divide-slate-100">
                              {Object.entries(adminPendingGroups).map(([username, items]) => (
                                  <div key={username} className="p-4 hover:bg-slate-50 transition-colors">
                                      <div className="flex justify-between items-center mb-2">
                                          <div>
                                              <div className="font-bold text-slate-800 text-sm">{users.find(u => u.username === username)?.name || username}</div>
                                              <div className="text-xs text-slate-400">{items.length} Pending Files</div>
                                          </div>
                                          <button 
                                              onClick={() => handleStaffReminder(username, items)}
                                              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm"
                                          >
                                              <WhatsAppIcon /> Remind
                                          </button>
                                      </div>
                                      <div className="space-y-1">
                                          {items.slice(0, 3).map(item => (
                                              <div key={item.id} className="text-[10px] text-slate-500 flex justify-between">
                                                  <span>{item.regnNo}</span>
                                                  <span className="text-red-400">{item.dueDate || 'No Due Date'}</span>
                                              </div>
                                          ))}
                                          {items.length > 3 && <div className="text-[10px] text-slate-400 italic">...and {items.length - 3} more</div>}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )
                  ) : (
                      // USER VIEW: List of My Pending Items
                      myPendingItems.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-sm">No pending tasks for you.</div>
                      ) : (
                          <div className="divide-y divide-slate-100">
                              {myPendingItems.map(item => (
                                  <div key={item.id} className="p-3 hover:bg-blue-50 cursor-pointer" onClick={() => {
                                      setSelectedVehicle(item);
                                      setShowNotificationPanel(false);
                                  }}>
                                      <div className="font-bold text-blue-600 text-sm">{item.regnNo}</div>
                                      <div className="text-xs text-slate-500 truncate">{item.ownerName}</div>
                                      <div className="mt-1 flex justify-between items-center">
                                          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">{item.fileStatus}</span>
                                          {item.dueDate && <span className="text-[10px] text-red-500 font-bold">Due: {item.dueDate}</span>}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )
                  )}
              </div>
          </div>
      )}

      {/* 3. Detail View Modal (Mobile Friendly) */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:w-full sm:max-w-2xl h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col animate-slide-up sm:animate-scale-in shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-6 flex justify-between items-start text-white shrink-0 shadow-md">
               <div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedVehicle.regnNo}</h2>
                  <p className="text-blue-100 text-sm font-medium mt-1 opacity-90">{selectedVehicle.ownerName}</p>
               </div>
               <div className="flex gap-2">
                   {/* WhatsApp Button on Detail */}
                   <button 
                       onClick={() => handleWhatsApp(selectedVehicle)}
                       className="p-2 bg-green-500/80 hover:bg-green-600 rounded-full transition-colors text-white"
                   >
                       <WhatsAppIcon />
                   </button>
                   <button 
                       onClick={() => openStatusModal(selectedVehicle)}
                       className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                   >
                       <PlusIcon />
                   </button>
                   <button onClick={() => setSelectedVehicle(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"><CloseIcon /></button>
               </div>
            </div>
            
            {/* Content */}
            <div className="overflow-y-auto p-5 flex-1 bg-slate-50">
                {/* Registry Status Banner */}
                <div className="mb-4 bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center justify-between">
                     <div>
                         <div className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Current Status</div>
                         <div className="font-bold text-slate-800 text-sm">{selectedVehicle.fileStatus || "Received"}</div>
                         <div className="text-xs text-slate-500">In {selectedVehicle.registerName || "General Register"} • {selectedVehicle.workDate}</div>
                         {selectedVehicle.assignedTo && (
                             <div className="text-xs font-bold text-purple-700 mt-1">Assigned to: {selectedVehicle.assignedTo}</div>
                         )}
                         {selectedVehicle.dueDate && (
                             <div className="text-xs font-bold text-red-600 mt-1">Due: {selectedVehicle.dueDate} {selectedVehicle.dueTime}</div>
                         )}
                     </div>
                     <button onClick={() => openStatusModal(selectedVehicle)} className="text-xs font-bold text-purple-600 bg-white px-3 py-1.5 rounded-lg border border-purple-100 shadow-sm">Update</button>
                </div>

                {/* Transfer Info Section if available */}
                {(selectedVehicle.transferName || selectedVehicle.transferAddress) && (
                    <div className="mb-4 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">New Transfer Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {selectedVehicle.transferName && (
                                <div><span className="text-slate-400 text-xs">New Owner:</span> <div className="font-semibold text-slate-700">{selectedVehicle.transferName}</div></div>
                            )}
                            {selectedVehicle.transferFatherName && (
                                <div><span className="text-slate-400 text-xs">Father:</span> <div className="font-semibold text-slate-700">{selectedVehicle.transferFatherName}</div></div>
                            )}
                             {selectedVehicle.mobileNo && (
                                <div><span className="text-slate-400 text-xs">Mobile:</span> <div className="font-semibold text-slate-700">{selectedVehicle.mobileNo}</div></div>
                            )}
                             {selectedVehicle.transferAddress && (
                                <div className="col-span-2"><span className="text-slate-400 text-xs">New Address:</span> <div className="font-semibold text-slate-700">{selectedVehicle.transferAddress}</div></div>
                            )}
                             {selectedVehicle.transferAadhaarNo && (
                                <div className="col-span-2"><span className="text-slate-400 text-xs">Aadhaar No:</span> <div className="font-semibold text-slate-700">{selectedVehicle.transferAadhaarNo}</div></div>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Iterate through relevant fields excluding rendering keys */}
                    {Object.entries(selectedVehicle).map(([key, value]) => {
                        if (['id', 'isSynced', 'timestamp', 'serialNo', 'remarks', 'entryBy', 'registerName', 'fileStatus', 'workDate', 'assignedTo', 'mobileNo', 'transferName', 'transferFatherName', 'transferAddress', 'transferAadhaarNo', 'dueDate', 'dueTime'].includes(key)) return null;
                        return (
                            <div key={key} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                <div className="text-slate-800 font-semibold text-sm break-words">{String(value)}</div>
                            </div>
                        );
                    })}
                </div>
                {/* Remarks Section */}
                {selectedVehicle.remarks && (
                    <div className="mt-6 bg-yellow-50 p-5 rounded-xl border border-yellow-200 shadow-sm">
                        <label className="block text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">Remarks</label>
                        <p className="text-slate-800 text-sm italic leading-relaxed">"{selectedVehicle.remarks}"</p>
                    </div>
                )}
                
                <div className="mt-6 text-center text-xs text-slate-400 font-medium">
                    Uploaded by {selectedVehicle.entryBy} on {selectedVehicle.timestamp}
                </div>
            </div>
            
            {/* Footer Actions */}
            <div className="p-5 bg-white border-t border-slate-100 flex justify-between items-center shrink-0 safe-pb">
               <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${selectedVehicle.isSynced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {selectedVehicle.isSynced ? (
                     <>
                        <CheckIcon /> Synced
                     </>
                   ) : 'Not Synced'}
               </span>
               <button onClick={() => setSelectedVehicle(null)} className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}


      <header className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-5 shadow-lg z-10 shrink-0 rounded-b-[2rem] md:rounded-none mx-0 md:mx-0 transition-all duration-300">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight drop-shadow-md">{APP_TITLE_HINDI}</h1>
              <p className="text-[10px] md:text-xs font-bold tracking-[0.15em] text-blue-100 opacity-90">{APP_TITLE_ENGLISH}</p>
            </div>
             
             {/* Mobile: Status + Notification */}
             <div className="md:hidden flex items-center gap-2">
                 <button onClick={() => setShowNotificationPanel(!showNotificationPanel)} className="relative p-2 rounded-full bg-white/20">
                     <BellIcon />
                     {notificationCount > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>}
                 </button>
                 <div className="text-[10px] font-bold text-blue-100 bg-white/10 px-2 py-1 rounded-md">
                    {currentUser?.name}
                 </div>
             </div>
          </div>

          <div className="flex flex-1 flex-col md:flex-row items-center justify-end gap-4 w-full md:w-auto">
            <div className="relative w-full md:max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/70"><SearchIcon /></div>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search vehicles..." className="w-full pl-11 pr-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm text-white placeholder-white/60 focus:outline-none focus:bg-white/30 focus:ring-2 focus:ring-white/50 transition-all shadow-inner" />
            </div>

            <div className="flex items-center gap-2 hidden md:flex"> 
              
              {/* Desktop User Profile Display */}
              <div className="flex items-center gap-2 mr-2">
                  {/* Notification Bell Desktop */}
                  <button onClick={() => setShowNotificationPanel(!showNotificationPanel)} className="relative p-2 mr-2 rounded-full hover:bg-white/10 transition-colors">
                     <BellIcon />
                     {notificationCount > 0 && <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] bg-red-500 text-white rounded-full border border-white font-bold">{notificationCount}</span>}
                  </button>

                  <span className="text-right">
                      <span className="block text-sm font-bold leading-tight">{currentUser?.name}</span>
                      <span className="block text-[10px] text-blue-200 uppercase tracking-wider leading-none opacity-80">{currentUser?.role}</span>
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 text-xs font-bold shadow-sm">
                      {currentUser?.name?.charAt(0)}
                  </div>
              </div>

              {/* Desktop Only Buttons */}
              {isAdmin && (
                <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-lg text-xs font-bold transition-all shadow-md transform hover:scale-105">
                  {showAdminPanel ? 'View Data' : 'Manage Users'}
                </button>
              )}
              <button onClick={handleLogout} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold text-white transition-all">LOGOUT</button>
            </div>
             {/* Mobile Logout (Icon only or small) */}
             <div className="md:hidden flex gap-2">
                 {isAdmin && (
                    <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="p-2 bg-white/20 rounded-full text-white">
                        <UserIcon />
                    </button>
                 )}
                 <button onClick={handleLogout} className="text-xs bg-red-500/80 px-4 py-1.5 rounded-full text-white font-bold backdrop-blur-sm">Exit</button>
             </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      
      {showAdminPanel && currentUser?.role === 'ADMIN' ? (
        <div className="flex-1 overflow-auto bg-slate-50/90 z-10 p-4 pb-28 md:pb-4">
           {/* Admin Panel Redesign */}
           <div className="container mx-auto max-w-6xl">
             <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                  <h2 className="text-2xl font-black text-slate-800">User Management</h2>
                  <div className="flex items-center gap-3">
                      <a href={SPREADSHEET_OPEN_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm">
                          <ExternalLinkIcon /> Open Master Sheet
                      </a>
                      <button onClick={() => openUserModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-md">
                          <PlusIcon /> Add New User
                      </button>
                      <button onClick={() => setShowAdminPanel(false)} className="px-4 py-2 text-slate-500 font-bold hover:text-slate-800">Back to Dashboard</button>
                  </div>
             </div>

             <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                     <tr>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name / Role</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Login ID</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Address</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Access</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {users.map(u => (
                        <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.role}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{u.username}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {u.address || <span className="text-slate-300 italic">No Address</span>}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                {u.mobile || <span className="text-slate-300 italic">No Mobile</span>}
                            </td>
                            <td className="px-6 py-4">
                                {u.canExport ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Admin/Export
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                        Viewer Only
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => openUserModal(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit User">
                                        <EditIcon />
                                    </button>
                                    {u.role !== 'ADMIN' && (
                                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                            <DeleteIcon />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           </div>
        </div>
      ) : (
        <>
          {/* Controls Area (Desktop) & Status (Mobile/Desktop) */}
          <div className="bg-white/80 backdrop-blur-md border-b border-white/50 p-3 md:p-4 shadow-sm shrink-0 z-10">
            <div className="container mx-auto flex flex-col gap-2 md:gap-4">
              
              {/* Desktop Buttons Toolbar (Hidden on Mobile) */}
              <div className="hidden md:flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <input type="file" ref={fileInputRef} accept="image/*, application/pdf" multiple onChange={handleFileSelect} className="hidden" id="file-upload" disabled={isProcessing} />
                  <label htmlFor="file-upload" className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg font-bold cursor-pointer transition-all transform hover:scale-105 active:scale-95 ${isProcessing ? 'bg-slate-300 text-slate-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}`}>
                    <UploadIcon /><span>Upload Files</span>
                  </label>
                  
                  <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" id="camera-upload" disabled={isProcessing} />
                  <label htmlFor="camera-upload" className="flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg font-bold cursor-pointer bg-gradient-to-r from-teal-500 to-emerald-500 text-white transform hover:scale-105 active:scale-95 transition-all">
                    <CameraIcon /><span>Camera</span>
                  </label>
                </div>

                <div className="flex-1 text-center">
                   <div className={`text-sm font-bold px-4 py-1 rounded-full inline-block ${typeof statusMessage === 'string' && statusMessage.includes('Sync') ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {statusMessage || "System Ready"}
                  </div>
                </div>

                {canExport && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSetupModal(true)}
                      className={`flex items-center gap-1 px-4 py-2 text-white rounded-lg shadow-md text-xs font-bold transform hover:scale-105 transition-all ${scriptUrl ? 'bg-slate-700' : 'bg-red-500 animate-pulse'}`}
                    >
                      <CogIcon /><span>SETUP</span>
                    </button>
                    {isAdmin && (
                       <button onClick={handleManualSync} className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 text-xs font-bold transition-colors">
                          <RefreshIcon /><span>SYNC</span>
                        </button>
                    )}
                    <button onClick={handleExport} disabled={data.length === 0} className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg font-bold text-white transition-all transform hover:scale-105 ${data.length === 0 ? 'bg-slate-300' : 'bg-gradient-to-r from-emerald-600 to-green-600'}`}>
                      <ExcelIcon /><span>Excel</span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Mobile Status Bar (Visible only on mobile) */}
              <div className="md:hidden text-center py-1">
                 <div className={`text-xs font-bold truncate px-4 py-1 rounded-full inline-block bg-white/50 backdrop-blur-md shadow-sm border border-white/50 ${typeof statusMessage === 'string' && statusMessage.includes('Sync') ? 'text-blue-600' : 'text-slate-600'}`}>
                    {statusMessage || "Ready to Scan"}
                 </div>
              </div>

              {/* Voice Input (Common - Optional in Dashboard now) */}
              <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-full border border-slate-200 w-full shadow-inner opacity-60">
                  <span className="text-slate-400 text-[10px] font-bold uppercase pl-3">Default Note</span>
                  <input type="text" value={voiceText} onChange={(e) => setVoiceText(e.target.value)} placeholder="Default remark for next scan..." className="flex-1 bg-transparent border-none text-sm px-2 text-slate-700 outline-none placeholder-slate-400" />
                  <button onClick={() => toggleMic(setVoiceText)} className={`p-2 rounded-full transition-all shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-400 hover:text-blue-600'}`}>
                    <MicIcon active={isListening} />
                  </button>
              </div>
            </div>
          </div>

          {/* Data Display Area */}
          <div className="flex-1 overflow-auto bg-slate-50/50 z-10 p-4 pb-32 md:pb-4">
            
            {/* Desktop View: Table (Simplified Columns + New Columns) */}
            <div className="hidden md:block container mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-800 text-white uppercase font-bold sticky top-0">
                    <tr>
                      <th className="px-4 py-3 border-r border-slate-700 text-xs tracking-wider w-16">S.No</th>
                      <th className="px-4 py-3 border-r border-slate-700 text-xs tracking-wider">Regn No</th>
                      <th className="px-4 py-3 border-r border-slate-700 text-xs tracking-wider">Old Owner</th>
                      <th className="px-4 py-3 border-r border-slate-700 text-xs tracking-wider text-blue-300">New Transfer Name</th>
                       <th className="px-4 py-3 border-r border-slate-700 text-xs tracking-wider">Status</th>
                       <th className="px-4 py-3 border-r border-slate-700 text-xs tracking-wider text-red-300">Due Date</th>
                      <th className="px-4 py-3 border-r border-slate-700 text-xs tracking-wider">Assigned</th>
                      <th className="px-4 py-3 border-r border-slate-700 text-xs tracking-wider text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedData.length === 0 ? (
                      <tr><td colSpan={8} className="px-6 py-20 text-center text-slate-400 font-medium">No records found. Upload files to begin.</td></tr>
                    ) : (
                      displayedData.map((row, idx) => (
                        <tr 
                           key={row.id} 
                           onClick={() => setSelectedVehicle(row)}
                           className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50 transition-colors cursor-pointer group`}
                        >
                          <td className="px-4 py-3 border-r border-slate-100 text-slate-500 font-mono">{row.serialNo}</td>
                          <td className="px-4 py-3 border-r border-slate-100 font-black text-blue-600 text-base">{row.regnNo}</td>
                          <td className="px-4 py-3 border-r border-slate-100 font-semibold text-slate-700">{row.ownerName}</td>
                          <td className="px-4 py-3 border-r border-slate-100 font-semibold text-blue-600">
                              {row.transferName ? (
                                  <div>
                                      <div>{row.transferName}</div>
                                      <div className="text-[10px] text-slate-400 font-normal truncate max-w-[150px]">{row.transferAddress}</div>
                                  </div>
                              ) : '-'}
                          </td>
                          <td className="px-4 py-3 border-r border-slate-100">
                              <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${row.fileStatus === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>
                                  {row.fileStatus || 'Received'}
                              </span>
                          </td>
                          <td className="px-4 py-3 border-r border-slate-100 text-xs font-bold text-red-500">{row.dueDate || '-'}</td>
                          <td className="px-4 py-3 border-r border-slate-100 text-xs font-bold text-purple-600">{row.assignedTo || '-'}</td>
                          
                          {/* Desktop Actions */}
                          <td className="px-4 py-3 border-r border-slate-100 text-center">
                               <div className="flex items-center justify-center gap-2">
                                   <button 
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           handleWhatsApp(row);
                                       }}
                                       className="w-8 h-8 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full shadow-sm transition-colors"
                                       title="Send WhatsApp"
                                   >
                                       <WhatsAppIcon />
                                   </button>
                                   <button 
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           openStatusModal(row);
                                       }}
                                       className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-full font-bold hover:bg-purple-700 shadow-md transform active:scale-95 transition-all"
                                   >
                                       Update
                                   </button>
                               </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View: Card List */}
            <div className="md:hidden space-y-4">
               {displayedData.length === 0 ? (
                  <div className="text-center p-10 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg mt-10">
                      <div className="text-slate-300 mb-4 mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                         <CameraIcon />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700">No Vehicles Yet</h3>
                      <p className="text-sm text-slate-500 mt-1">Tap the camera button to scan your first RC.</p>
                  </div>
               ) : (
                  displayedData.map((item) => (
                      <MobileCard 
                        key={item.id} 
                        item={item} 
                        onSelect={setSelectedVehicle} 
                        onStatusUpdate={openStatusModal}
                        onWhatsApp={handleWhatsApp} 
                      />
                  ))
               )}
            </div>
            
          </div>
          
          {/* Mobile Bottom Action Bar (Floating) */}
          <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 px-6 py-3 flex justify-between items-center z-40 animate-slide-up">
             {/* 1. Upload Button */}
             <div className="flex flex-col items-center gap-1">
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isProcessing}
                   className="p-3 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                 >
                    <UploadIcon />
                 </button>
             </div>

             {/* 2. Camera Button (Main Action - Elevated & Gradient) */}
             <div className="relative -top-8">
                 <button 
                   onClick={() => cameraInputRef.current?.click()}
                   disabled={isProcessing}
                   className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 border-4 border-white transform transition-transform active:scale-95 ${isProcessing ? 'bg-slate-400' : 'bg-gradient-to-tr from-blue-500 to-teal-400 text-white'}`}
                 >
                    {isProcessing ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <CameraIcon />
                    )}
                 </button>
             </div>

             {/* 3. Sync Button */}
             <div className="flex flex-col items-center gap-1">
               {isAdmin && (
                 <button 
                    onClick={handleManualSync}
                    className="p-3 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                 >
                    <RefreshIcon />
                 </button>
               )}
             </div>
          </div>
          
        </>
      )}

      {/* Footer Branding (Hidden on mobile) */}
      <footer className="hidden md:block bg-slate-900 text-slate-500 p-2 text-center shrink-0 border-t border-slate-800">
        <p className="font-bold text-xs tracking-widest uppercase opacity-50">{APP_TITLE_ENGLISH}</p>
      </footer>
    </div>
  );
}