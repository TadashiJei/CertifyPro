import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const GOOGLE_FONTS = [
  'Arial',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Playfair Display',
  'Merriweather',
  'Raleway',
  'Poppins',
  'Source Sans Pro',
  'Oswald',
  'Dancing Script',
  'Great Vibes',
  'Pacifico',
];

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select font" />
      </SelectTrigger>
      <SelectContent>
        {GOOGLE_FONTS.map((font) => (
          <SelectItem 
            key={font} 
            value={font}
            style={{ fontFamily: font }}
          >
            {font}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
