# Digiformation ltd

DIGIFORMATION LTD
Company Number: 16994903

Website Pages, Content & SEO Strategy
FORMATION SERVICES  PAYMAENT SOLUTIONS 

February 2026 • Version 1.0

Website Overview
Digiformation Ltd is a professional business services company that provides company formation in the UK and USA, Trade In UK shelf companies, payment gateway setup, business bank account assistance Providing Company Taxation services and web development services as well. The website will serve as the company’s primary digital presence, designed to attract clients, showcase services, demonstrate expertise through content, and generate qualified leads. Every page is designed with both the user journey and search engine optimization in mind.
The website will consist of 28 core pages, plus dynamic sections for blog posts and case studies that will grow over time. Every page is designed with both the user journey and search engine optimisation in mind.

Total Page Count
Page Type	Count	Notes
Core Static Pages		Home , UK Services 8 sub pages ,uk company compliance 9 sub pages 
USA Services 5 sub pages , Banks & Payment Solutions 12 sub pages ,Web Development, Client area ,FAQ, Blog, Pricing ,About, Contact 
2. Complete Site Architecture
Below is the full sitemap with URL slugs. The structure uses a clear hierarchy: top-level pages for main sections and second-level pages for individual services and dynamic content.

#	Page Name	URL Path	Type
1	Home	/	Core
1























2	UK Services



UK Services sub pages 

•	UK LTD Formation
•	LTD ID Verification
•	Registered Office Address
•	Company Annual Filing
•	UTR Number Service
•	Auth Code Service
•	Activation Code Service
•	UK VAT Registration & Submission

UK LTD Compliance
________________________________________
UK LTD Compliance (Sub Pages)
•	Company Name Change Service
•	Company Address Change Service
•	Annual Accounts Filing Service
•	Confirmation Statement Service
•	Company Director Appoint & Remove Service
•	Company Shareholder Appoint & Remove Service
•	Company PSC & Secretary Appoint & Remove Service
•	Company Residence Change Service
•	AD01 Form Post Service
	/UK-services
 (Parent PAGE )	Service
3	USA Services
	/uk-services
Service (Parent PAGE )	Service
	US LLC Formation 	/ usa-services /us-llc-formation
Service (Sub-page)	
Service
	EIN Number 
	/ usa-services /ein-number
Service (Sub-page)	Service
	ITIN Number
	/ usa-services /itin-number
Service (Sub-page)	Service
	Annual Tax Filing
	/ usa-services /annual-tax-filing
Service (Sub-page)	Service
	BIO Report
	/ usa-services /bio-report
Service (Sub-page)	Service
4	Banks & Payment Solutions

10 sub pages under payments 
	/banks-payment-solutions
Service
	Service
1	Paypal	/banks-payment-solutions/paypal	Service
2	Payoneer	/banks-payment-solutions/payoneer	Service
3	WorldFirst	/banks-payment-solutions/worldfirst	Service
4	Stripe	/banks-payment-solutions/stripe	Service
5	Tide	/banks-payment-solutions/tide	Service
6	Sunrate	/banks-payment-solutions/sunrate	Service
7	Wise	/banks-payment-solutions/wise	Service
8	Zyla	/banks-payment-solutions/zyla	Service 
9	Airwallex	/banks-payment-solutions/airwallex	Service
10

11

12


5	Mollie

Wallester 

Zionpe


Web develpment	/banks-payment-solutions/mollie	Service
6	Client area 		Service
7	FAQ
	/faq
	Core
8	Blog
	/blog
	Core
9

10	Pricing

About 	/pricing

/about	Core
11	Contact
	/contact
	Core
12	Privacy Policy & Terms	/privacy-policy  |  /terms	Legal










Navigation Structure
Primary Header Menu
Home  , UK Services dropdown with 8 sub-pages ,uk company compliance dropdown with 9 sub pages   | USA Services dropdown with 5 sub-pages | Banks & Payment Solutions dropdown with 12 sub-pages |  Web Development|  client area |  FAQ |  Blog | pricing  | About  |  Contact
Persistent CTA
“Book a FREE Consultation” button will always be visible in the header.
Footer 
3. Page-by-Page Content Breakdown
Each page below includes: its purpose, every content section with details, SEO target keywords, suggested meta title and description, and schema markup recommendations.

Page 1: Home
Page 1: Home
URL: /
Purpose:
Strong first impression for global entrepreneurs. Showcase Digiformation Ltd as the trusted one-stop platform for UK & US company formation, banking, payment gateways, compliance, web development, and ready-made UK Shelf Companies. Encourage visitors to explore services or book a consultation.
All cards should be glass transparent cards 
Content Sections
1. Hero Section (Dynamic Headline)
Headline (rotating/movable):
“Establish Your UK or US Business in Days”
“500+ Companies Successfully Registered”

Subheadline: “Fast, Transparent, and Fully Supported Company Formation, Banking, Payments, Compliance & Web Services for Entrepreneurs Worldwide”
Primary CTA: “Book Your Free Consultation”
Secondary CTA: “Explore All Services”

Prompt for service slider 

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DigiFormation — 3D Services Slider</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

<style>
:root {
  --gold:       #C9A84C;
  --gold-light: #E8C97A;
  --gold-dim:   rgba(201,168,76,0.15);
  --dark:       #080808;
  --dark-card:  #111111;
  --dark-card2: #161616;
  --white:      #FFFFFF;
  --white-60:   rgba(255,255,255,0.60);
  --white-30:   rgba(255,255,255,0.30);
  --white-10:   rgba(255,255,255,0.08);
  --font-d: 'Cormorant Garamond', serif;
  --font-b: 'DM Sans', sans-serif;
  --font-u: 'Space Grotesk', sans-serif;
}

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
body {
  background: var(--dark);
  color: var(--white);
  font-family: var(--font-b);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
}

/* ── HERO WRAPPER ── */
.hero-slider-section {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px 80px;
  position: relative;
  overflow: hidden;
}

/* subtle grid bg */
.hero-slider-section::before {
  content:'';
  position:absolute; inset:0;
  background-image:
    linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
    linear-gradient(90deg,rgba(201,168,76,0.03) 1px, transparent 1px);
  background-size: 72px 72px;
  pointer-events:none;
}

/* gold glow orb */
.glow-orb {
  position:absolute;
  width:600px; height:600px;
  background:radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%);
  top:-150px; right:-150px;
  pointer-events:none;
  animation: orbPulse 7s ease-in-out infinite;
}
@keyframes orbPulse {
  0%,100%{transform:scale(1);opacity:.7}
  50%{transform:scale(1.15);opacity:1}
}

/* ── HEADLINE ABOVE SLIDER ── */
.slider-headline {
  text-align:center;
  margin-bottom: 56px;
  position:relative; z-index:2;
}
.slider-tag {
  font-family:var(--font-u);
  font-size:11px; font-weight:600;
  letter-spacing:.18em; text-transform:uppercase;
  color:var(--gold);
  margin-bottom:18px;
  display:flex; align-items:center; justify-content:center; gap:10px;
}
.slider-tag::before, .slider-tag::after {
  content:''; width:28px; height:1px; background:var(--gold);
}
.slider-headline h1 {
  font-family:var(--font-d);
  font-size: clamp(42px,6vw,96px);
  font-weight:300; line-height:.95;
  letter-spacing:-0.02em;
}
.slider-headline h1 em {
  font-style:italic; font-weight:600; color:var(--gold);
}

/* ── 3D CAROUSEL STAGE ── */
.carousel-stage {
  position:relative;
  width:100%; max-width:1100px;
  height:440px;
  perspective: 1200px;
  perspective-origin: 50% 50%;
  z-index:2;
  cursor: grab;
  user-select:none;
}
.carousel-stage:active { cursor:grabbing; }

.carousel-track {
  width:100%; height:100%;
  position:relative;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.23,1,0.32,1);
}

/* ── INDIVIDUAL CARD ── */
.c-card {
  position:absolute;
  width: 300px;
  height: 400px;
  top: 50%; left: 50%;
  margin-left: -150px;
  margin-top: -200px;
  border-radius: 4px;
  border: 1px solid rgba(201,168,76,0.12);
  background: var(--dark-card);
  display:flex; flex-direction:column;
  padding: 40px 32px 36px;
  backface-visibility: hidden;
  transition: box-shadow 0.5s, border-color 0.5s, background 0.5s;
  transform-style: preserve-3d;
}

/* active card glows */
.c-card.is-active {
  border-color: rgba(201,168,76,0.45);
  background: var(--dark-card2);
  box-shadow:
    0 0 60px rgba(201,168,76,0.10),
    0 30px 80px rgba(0,0,0,0.7),
    inset 0 1px 0 rgba(201,168,76,0.2);
}

/* top accent line */
.c-card::before {
  content:'';
  position:absolute; top:0; left:0; right:0;
  height:2px;
  background:linear-gradient(to right, transparent, var(--gold), transparent);
  opacity:0;
  transition: opacity 0.5s;
  border-radius:4px 4px 0 0;
}
.c-card.is-active::before { opacity:1; }

.card-num {
  font-family:var(--font-d);
  font-size:68px; font-weight:700;
  color:rgba(201,168,76,0.05);
  line-height:1;
  position:absolute; top:20px; right:24px;
  transition: color 0.5s;
  pointer-events:none;
}
.c-card.is-active .card-num { color:rgba(201,168,76,0.10); }

.card-icon {
  width:52px; height:52px;
  margin-bottom:28px;
  flex-shrink:0;
}
.card-icon svg {
  width:100%; height:100%;
  stroke:var(--gold); fill:none; stroke-width:1.2;
  stroke-linecap:round; stroke-linejoin:round;
}
.card-flag { font-size:36px; margin-bottom:20px; display:block; line-height:1; }

.card-cat {
  font-family:var(--font-u);
  font-size:10px; font-weight:600;
  letter-spacing:.14em; text-transform:uppercase;
  color:var(--gold);
  margin-bottom:12px;
  opacity:.8;
}
.card-title {
  font-family:var(--font-d);
  font-size:26px; font-weight:600;
  line-height:1.15;
  margin-bottom:14px;
  transition: color 0.3s;
}
.c-card.is-active .card-title { color:var(--gold-light); }

.card-desc {
  font-family:var(--font-b);
  font-size:13.5px; color:var(--white-30);
  line-height:1.7;
  flex:1;
}

.card-arrow {
  display:inline-flex; align-items:center; gap:8px;
  margin-top:24px;
  font-family:var(--font-u);
  font-size:11px; font-weight:600;
  letter-spacing:.10em; text-transform:uppercase;
  color:var(--gold); text-decoration:none;
  transition: gap 0.3s;
  opacity:0; pointer-events:none;
  transition: opacity 0.4s, gap 0.3s;
}
.c-card.is-active .card-arrow {
  opacity:1; pointer-events:auto;
}
.card-arrow:hover { gap:14px; }

/* ── SIDE CARDS VISUAL DEPTH ── */

/* Navigation Dots */
.carousel-dots {
  display:flex; gap:10px; justify-content:center;
  margin-top:44px; position:relative; z-index:2;
}
.dot {
  width:6px; height:6px; border-radius:50%;
  background:rgba(255,255,255,0.2);
  cursor:pointer; transition:all .4s;
  border:none;
}
.dot.active {
  background:var(--gold);
  width:24px; border-radius:3px;
}

/* Nav arrows */
.carousel-nav {
  display:flex; gap:16px; justify-content:center;
  margin-top:20px; position:relative; z-index:2;
}
.nav-btn {
  width:48px; height:48px;
  border:1px solid rgba(201,168,76,0.25);
  border-radius:50%;
  background:transparent;
  color:var(--white-60);
  cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:all .3s;
}
.nav-btn:hover {
  border-color:var(--gold);
  background:rgba(201,168,76,0.08);
  color:var(--gold);
}
.nav-btn svg { width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:2; }

/* drag hint */
.drag-hint {
  position:relative; z-index:2;
  font-family:var(--font-u);
  font-size:10px; letter-spacing:.14em; text-transform:uppercase;
  color:var(--white-30);
  margin-top:14px;
  text-align:center;
  display:flex; align-items:center; gap:8px; justify-content:center;
}
.drag-hint svg { width:16px; height:16px; stroke:var(--white-30); fill:none; opacity:.6; }

/* ── RESPONSIVE ── */
@media(max-width:768px){
  .carousel-stage { height:360px; }
  .c-card { width:270px; height:360px; margin-left:-135px; margin-top:-180px; padding:32px 24px 28px; }
  .slider-headline h1 { font-size:clamp(36px,9vw,60px); }
}
@media(max-width:480px){
  .carousel-stage { height:340px; }
  .c-card { width:250px; height:340px; margin-left:-125px; margin-top:-170px; }
}








  


    

Our Services


    


      Everything Your

      Business Needs
    



  


    



      
      


        01
        🇬🇧
        

UK Formation


        

UK LTD Company Formation


        

Register a UK Limited Company with Companies House. Fast, compliant, managed from anywhere in the world.


        Explore Service 
      



      
      


        02
        


          
            
            
            
            
          
        


        

UK Compliance


        

LTD ID Verification


        

Companies House identity verification for directors & PSCs. Secure, fast, and fully DIATF compliant.


        Explore Service 
      



      
      


        03
        


          
            
            
          
        


        

UK Compliance


        

Company Compliance Services


        

Name change, director updates, address change, SIC code, PSC, shareholders, confirmation statements & more — 13 services.


        Explore Service 
      



      
      


        04
        🇺🇸
        

USA Formation


        

US LLC Formation


        

Register a US LLC remotely. Access PayPal, Stripe, Amazon, and the US market without being physically present in America.


        Explore Service 
      



      
      


        05
        


          
            
            
            
            
          
        


        

Banking


        

Banks & Payment Solutions


        

Tide, Airwallex, Wise, Payoneer, Stripe, PayPal, WorldFirst, Sunrate, Zyla, Mollie, Wallester, Zionpe & more.


        Explore Service 
      



      
      


        06
        


          
            
            
            
          
        


        

UK Compliance


        

Company Annual Filing


        

Confirmation statements, annual accounts filing and all statutory returns submitted to Companies House on time.


        Explore Service 
      



      
      


        07
        


          
            
            
            
          
        


        

Technology


        

Web Development


        

Professional websites, landing pages, and e-commerce solutions for your UK or US business. From concept to launch.


        Explore Service 
      



      
      


        08
        


          
            
            
            
          
        


        

USA Services


        

EIN Number Registration


        

Get your US Employer Identification Number (EIN) from the IRS. Required for US business banking and tax compliance.


        Explore Service 
      



    



  



  


    
      
    
    
      
    



  


    
    Drag or use arrows to explore
  












2. Trust & Credibility Bar
Logos of verified partners and certifications:
Companies House | IRS | Stripe | PayPal | Wise | Payoneer | Tide | Sunrate | Worldfirst | Ebay | Shopify | Airwallex  | zionpe  | wallester 

Prompt
@keyframes partnerSlide {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.logo-card {
  width: 140px;
  height: 78px;
  flex-shrink: 0;
  border-radius: 20px;
  position: relative;
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  background: linear-gradient(160deg, #f2f4f7 0%, #e4e8ef 50%, #dae0e8 100%);
  box-shadow:
    -1px -1px 1px rgba(255,255,255,0.95),
    2px  2px  2px rgba(160,175,200,0.55),
    0 6px 18px rgba(100,120,150,0.26),
    0 18px 44px rgba(80,100,130,0.15),
    0 2px 5px  rgba(0,0,0,0.07);
  border: 1px solid rgba(255,255,255,0.92);
  border-bottom: 1px solid rgba(180,195,215,0.65);
  border-right:  1px solid rgba(190,205,220,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
}
.logo-card::before {
  content: "";
  position: absolute;
  top: 5px; left: 10px; right: 10px;
  height: 36%;
  border-radius: 14px 14px 50% 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.16) 70%, transparent 100%);
  pointer-events: none;
  z-index: 2;
}
.logo-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(to bottom, transparent 55%, rgba(150,170,200,0.10) 100%);
  pointer-events: none;
  z-index: 1;
}
.logo-card:hover {
  transform: translateY(-5px) scale(1.04);
  box-shadow:
    -1px -1px 1px rgba(255,255,255,0.95),
    2px  2px  2px rgba(160,175,200,0.55),
    0 12px 28px rgba(100,120,150,0.3),
    0 24px 52px rgba(80,100,130,0.2);
}
.logo-card img {
  width: auto; height: auto;
  object-fit: contain;
  display: block;
  position: relative;
  z-index: 3;
}




Trusted Partners & Official Integrations

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://formflow-digital-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7fdd4386-cc12-4de2-bfa1-e37e725edfcd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
