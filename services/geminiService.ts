import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION, AADHAAR_SYSTEM_INSTRUCTION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the response schema for type safety from the model
const vehicleSchema = {
  type: Type.OBJECT,
  properties: {
    regnNo: { type: Type.STRING },
    dateOfRegn: { type: Type.STRING },
    regnValidity: { type: Type.STRING },
    ownerSerial: { type: Type.STRING },
    chassisNo: { type: Type.STRING },
    engineMotorNo: { type: Type.STRING },
    ownerName: { type: Type.STRING },
    relativeName: { type: Type.STRING },
    ownership: { type: Type.STRING },
    address: { type: Type.STRING },
    fuel: { type: Type.STRING },
    emissionNorms: { type: Type.STRING },
    vehicleClass: { type: Type.STRING },
    makerName: { type: Type.STRING },
    modelName: { type: Type.STRING },
    colorBodyType: { type: Type.STRING },
    seatingCapacity: { type: Type.STRING },
    unladenLadenWeight: { type: Type.STRING },
    cubicCap: { type: Type.STRING },
    financier: { type: Type.STRING },
    horsePower: { type: Type.STRING },
    wheelBase: { type: Type.STRING },
    mfgMonthYear: { type: Type.STRING },
    noOfCylinders: { type: Type.STRING },
    regAuthority: { type: Type.STRING },
  },
  required: ["regnNo", "chassisNo", "ownerName"], 
};

// Define Schema for Aadhaar extraction
const aadhaarSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        fatherName: { type: Type.STRING },
        address: { type: Type.STRING },
        aadhaarNo: { type: Type.STRING },
    },
    required: ["name", "aadhaarNo"],
};

export const extractVehicleData = async (base64Data: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this document (image or PDF). It may contain front and back sides. Consolidate all vehicle details into a SINGLE JSON object. If the 'Regn No' or any other field appears twice (duplicates), ignore the duplicate and use the clearest one. Do NOT create multiple entries for the same vehicle.",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: vehicleSchema,
        temperature: 0.1, // Low temperature for high accuracy
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};

export const extractAadhaarData = async (images: { base64: string, mimeType: string }[]) => {
    try {
      // Create parts for all uploaded images (Front + Back)
      const imageParts = images.map(img => ({
          inlineData: {
              data: img.base64,
              mimeType: img.mimeType
          }
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            ...imageParts,
            {
              text: "Extract Aadhaar card details. The input may contain multiple images (e.g. Front side and Back side). Combine information from all images to fill the fields.",
            },
          ],
        },
        config: {
          systemInstruction: AADHAAR_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: aadhaarSchema,
          temperature: 0.1, 
        },
      });
  
      const text = response.text;
      if (!text) throw new Error("No data returned from AI");
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Aadhaar Extraction Error:", error);
      throw error;
    }
  };