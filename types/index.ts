export interface ServiceCardProps {
    bgColor: string;
    title: string;
    description: string;
    imageUri?: string;
    customIcon?: boolean;
  }
  
  export interface BannerCardProps {
    bgColor: string;
    title: string;
  }
  
  export interface NavItemProps {
    label: string;
    isActive?: boolean;
  }