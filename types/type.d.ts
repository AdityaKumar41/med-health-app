import { IconProps } from "@expo/vector-icons/build/createIconSet";

declare interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: string;
  error?: string;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
  placeholder: string;
  value: string;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | undefined;
  onChangeText?: (text: string) => void;
}

export interface FormData {
  fullName: string;
  email: string;
  age: string;
  gender: string;
  bloodGroup: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface InputDetailType {
  label: string;
  placeholder: string;
  key: keyof FormData;
  icon: string;
  secureTextEntry?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | undefined;
}

export interface SpecialtyCardProps {
  emoji: string;
  title: string;
  description: string;
}

export interface SearchBarProps {
  placeholder: string;
}

export interface DoctorProps {
  name: string;
  specialty: string;
  price: string;
  rating: string;
  imageUrl: string;
}

export interface SearchBarProps {
  placeholder: string;
}

export interface FilterButtonProps {
  label: string;
}

export interface MenuItem {
  icon: IconProps;
  label: string;
  value?: string;
}

export interface MenuSectionProps {
  title: string;
  items: {
    icon: any;
    label: string;
    value?: string | number;
    isEditing?: boolean;
    editable?: boolean;
  }[];
  onValueChange?: (label: string, value: string) => void;
}

export interface AppointmentProps {
  name: string;
  specialty: string;
  date: string;
  image?: string;
  onPress: () => void;
}

export interface AppointmentSchema {
  patient_id: string;
  doctor_id: string;
  date: string;
  appointment_fee: string;
  amount_paid: string;
  ticket_notes: string;
}

export interface SpecialityProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface ReportSchema {
  patient_id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  report_type: string;
  report_date: string;
}
