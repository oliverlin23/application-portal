import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Profile {
  name?: string
  email?: string
  parentEmail?: string
  phoneNumber?: string
  address?: string
}

export function isProfileComplete(profile: Profile) {
  const requiredFields = ['name', 'email', 'parentEmail', 'phoneNumber', 'address'] as const
  return requiredFields.every(field => profile?.[field])
}
