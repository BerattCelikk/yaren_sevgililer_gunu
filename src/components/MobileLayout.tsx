import { ReactNode } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
}

export default function MobileLayout({ children, backgroundImage }: MobileLayoutProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Keep page background black; image will be placed inside the 9:16 frame below */}

      <div className="relative w-full h-full md:flex md:items-center md:justify-center">
        <div className="w-full h-full md:h-[calc(100vh-2rem)] md:max-h-[844px] md:max-w-[430px] md:rounded-2xl md:overflow-hidden md:shadow-2xl relative flex items-center justify-center">
          <div
            className="w-full overflow-hidden relative bg-black"
            style={{
              width: '100%',
              maxWidth: '430px',
              aspectRatio: '9/16',
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: backgroundImage ? 'brightness(0.7)' : undefined
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
