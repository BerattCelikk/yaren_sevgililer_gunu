import { ReactNode } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
}

export default function MobileLayout({ children, backgroundImage }: MobileLayoutProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {backgroundImage && (
        <div
          className="hidden md:block absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            filter: 'blur(20px) brightness(0.5)',
            transform: 'scale(1.1)'
          }}
        />
      )}

      <div className="relative w-full h-full md:flex md:items-center md:justify-center">
        <div className="w-full h-full md:h-[calc(100vh-2rem)] md:max-h-[844px] md:max-w-[430px] md:rounded-2xl md:overflow-hidden md:shadow-2xl relative">
          {children}
        </div>
      </div>
    </div>
  );
}
