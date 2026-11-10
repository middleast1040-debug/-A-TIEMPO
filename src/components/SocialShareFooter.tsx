import React, { useState } from 'react';
import { Share2, Check, ExternalLink } from 'lucide-react';

interface SocialShareFooterProps {
  currentRouteCode?: string;
  cityName?: string;
}

export const SocialShareFooter: React.FC<SocialShareFooterProps> = ({
  currentRouteCode = 'TM',
  cityName = 'Bogotá',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const shareText = encodeURIComponent(
    `¡Te recomiendo «A Tiempo»! Calcula la salida exacta para abordar tu bus en ${cityName} sin esperas ni filas:`
  );
  const shareUrl = encodeURIComponent('https://atiempo.app');

  const shareLinks = [
    {
      name: 'Facebook',
      color: 'hover:bg-[#1877F2]/10 hover:border-[#1877F2]/40 hover:text-[#1877F2]',
      darkColor: 'dark:hover:bg-[#1877F2]/20 dark:hover:border-[#1877F2]/50 dark:hover:text-[#38BDF8]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      color: 'hover:bg-[#25D366]/10 hover:border-[#25D366]/40 hover:text-[#25D366]',
      darkColor: 'dark:hover:bg-[#25D366]/20 dark:hover:border-[#25D366]/50 dark:hover:text-[#00E676]',
      url: `https://api.whatsapp.com/send?text=${shareText}%20https://atiempo.app`,
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.3-.778.978-.954 1.178-.175.2-.351.226-.652.075s-1.272-.469-2.423-1.496c-.896-.799-1.5-1.787-1.676-2.088-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.176.201-.301.301-.502.1-.2.05-.376-.025-.526-.075-.151-.678-1.631-.929-2.233-.244-.585-.492-.506-.677-.515-.175-.008-.376-.01-.577-.01-.2 0-.527.075-.803.376s-1.054 1.029-1.054 2.509 1.079 2.909 1.23 3.109c.15.2 2.122 3.24 5.141 4.544.718.31 1.278.496 1.716.635.722.23 1.38.197 1.9.12.579-.087 1.78-.728 2.03-1.431.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351zM12.042 21.905c-1.777 0-3.518-.477-5.044-1.385l-.361-.214-3.743.982 1-3.649-.235-.374a9.86 9.86 0 0 1-1.516-5.26c0-5.445 4.43-9.875 9.879-9.875 2.64 0 5.12 1.028 6.983 2.893a9.82 9.82 0 0 1 2.887 6.982c-.001 5.446-4.431 9.876-9.879 9.876m0-21.905C5.402 0 0 5.402 0 12.042c0 2.12.553 4.188 1.604 6.01L0 24l6.106-1.601a12.003 12.003 0 0 0 5.936 1.564h.005c6.64 0 12.042-5.402 12.042-12.042 0-3.217-1.253-6.241-3.528-8.516A11.965 11.965 0 0 0 12.042 0z" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      color: 'hover:bg-[#229ED9]/10 hover:border-[#229ED9]/40 hover:text-[#229ED9]',
      darkColor: 'dark:hover:bg-[#229ED9]/20 dark:hover:border-[#229ED9]/50 dark:hover:text-[#38BDF8]',
      url: `https://t.me/share/url?url=${shareUrl}&text=${shareText}`,
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.941z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-2 text-xs border-t border-slate-100 dark:border-[#1C2A3E]">
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <Share2 className="w-3.5 h-3.5 text-[#0060EA] dark:text-[#38BDF8]" />
        <span>Comparte y síguenos en redes:</span>
      </div>

      <div className="flex items-center gap-2">
        {shareLinks.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Compartir en ${item.name}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1C2A3E] bg-[#F8FAFC] dark:bg-[#0E1726] text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer shadow-xs ${item.color} ${item.darkColor}`}
          >
            {item.icon}
            <span className="text-[11px]">{item.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
