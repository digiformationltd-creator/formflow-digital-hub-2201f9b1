import { useLocation } from "react-router-dom";
import { trackWhatsAppClick } from "@/lib/analytics";

// Map URL path patterns → friendly pre-filled WhatsApp message.
const buildMessage = (pathname: string): string => {
  const p = pathname.toLowerCase();
  let topic = "your services";
  if (p.includes("uk-ltd") || p.includes("uk-services")) topic = "UK LTD company formation";
  else if (p.includes("us-llc") || p.includes("usa-services")) topic = "US LLC company formation";
  else if (p.includes("banks") || p.includes("payment")) topic = "banking & payment account setup";
  else if (p.includes("compliance") || p.includes("annual")) topic = "UK compliance & annual filing";
  else if (p.includes("web-development")) topic = "web development services";
  else if (p.includes("pricing")) topic = "your pricing & packages";
  else if (p.includes("blog/")) topic = "the article I'm reading on your blog";

  return `Hello Digiformation, I'd like to know more about ${topic}. (sent from ${pathname})`;
};

const WhatsAppFloat = () => {
  const { pathname } = useLocation();
  const text = encodeURIComponent(buildMessage(pathname));

  return (
    <a
      href={`https://wa.me/923164467464?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick("floating_button")}
      aria-label="Chat with us on WhatsApp"
      className="hide-on-nav-open fixed bottom-5 right-5 z-50 group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] hover:drop-shadow-[0_14px_30px_rgba(37,211,102,0.55)] hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
    >
      {/* 100% Authentic Official WhatsApp Brand Emblem */}
      <svg
        viewBox="0 0 175.216 175.552"
        className="w-full h-full"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="wa-float-gradient"
            x1="85.915"
            x2="86.535"
            y1="32.567"
            y2="137.092"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#25D366" />
            <stop offset="100%" stopColor="#20BA59" />
          </linearGradient>
        </defs>
        {/* Crisp white outer speech bubble border with tail */}
        <path
          fill="#ffffff"
          d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
        />
        {/* Vibrant official WhatsApp green bubble */}
        <path
          fill="url(#wa-float-gradient)"
          d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
        />
        {/* Iconic solid white phone handset receiver */}
        <path
          fill="#ffffff"
          fillRule="evenodd"
          d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
        />
      </svg>

      {/* Online activity ping dot */}
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 pointer-events-none">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#25D366] border-2 border-white shadow-sm"></span>
      </span>

      {/* Desktop hover tooltip */}
      <span className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        Chat on WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppFloat;
