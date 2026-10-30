/**
 * DigiFormation Ask AI — Proactive Business Consultant & Smart Follow-Up Recommendation Engine
 * 
 * Provides:
 * - Lightweight conversational business profile extraction (jurisdiction, business type, marketplace, etc.)
 * - Contextual follow-up generation for every meaningful customer inquiry
 * - Dynamic category matching across Company Formation, Banking, Payments, Tax & Compliance, E-commerce, and Business Development
 * - Strict deduplication and anti-repetition rules
 */

export type BusinessCategory =
  | 'ecommerce'
  | 'freelance_it'
  | 'agency'
  | 'trading'
  | 'logistics'
  | 'saas_software'
  | 'consulting'
  | 'general';

export type FollowUpCategory =
  | 'company_formation'
  | 'banking'
  | 'payments'
  | 'tax_compliance'
  | 'ecommerce'
  | 'business_development'
  | 'pricing'
  | 'discovery';

export interface BusinessProfile {
  business_name?: string | null;
  business_type?: BusinessCategory | null;
  marketplace?: 'amazon' | 'ebay' | 'etsy' | 'walmart' | 'shopify' | 'tiktok' | null;
  fulfilment_model?: 'fba' | 'fbm' | 'dropshipping' | 'wholesale' | 'direct' | null;
  residence_country?: string | null;
  preferred_jurisdiction?: 'uk_ltd' | 'us_llc' | 'both' | null;
  us_state?: string | null;
  company_type?: string | null;
  banking_needs?: string[] | null;
  payment_requirements?: string[] | null;
  formation_status?: 'not_registered' | 'registered' | 'looking_to_change' | null;
}

export interface BusinessFollowUpSuggestion {
  label: string;
  prompt: string;
  category: FollowUpCategory;
}

export interface FollowUpGenerationParams {
  currentMessage: string;
  aiResponse?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  profile?: BusinessProfile;
  previousSuggestions?: string[];
}

/**
 * Extracts and updates a lightweight business profile from conversation history.
 * Seamlessly handles mid-conversation pivots (e.g. from UK to US, or freelancer to e-commerce).
 */
export function extractBusinessProfile(
  messages: Array<{ role: string; content: string }>,
  currentProfile: BusinessProfile = {}
): BusinessProfile {
  const profile: BusinessProfile = { ...currentProfile };

  // Scan user messages in chronological order so later statements take precedence
  const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content.toLowerCase());

  for (const text of userMessages) {
    // 1. Business Type Detection (with pivot awareness)
    if (/\b(drop\s*ship|dropshipping|dropshipper)\b/.test(text)) {
      profile.business_type = 'ecommerce';
      profile.fulfilment_model = 'dropshipping';
    } else if (/\b(amazon\s*fba|fba)\b/.test(text)) {
      profile.business_type = 'ecommerce';
      profile.marketplace = 'amazon';
      profile.fulfilment_model = 'fba';
    } else if (/\b(amazon\s*fbm|fbm)\b/.test(text)) {
      profile.business_type = 'ecommerce';
      profile.marketplace = 'amazon';
      profile.fulfilment_model = 'fbm';
    } else if (/\b(e-?commerce|online\s*store|shopify|etsy|ebay|walmart|sell\s*online)\b/.test(text)) {
      profile.business_type = 'ecommerce';
      if (text.includes('shopify')) profile.marketplace = 'shopify';
      if (text.includes('ebay')) profile.marketplace = 'ebay';
      if (text.includes('walmart')) profile.marketplace = 'walmart';
      if (text.includes('etsy')) profile.marketplace = 'etsy';
      if (text.includes('amazon')) profile.marketplace = 'amazon';
    } else if (/\b(work\s+in\s+it|it\s+industry|information\s+technology|it\s*freelanc|freelanc|software\s*eng|developer|programmer|tech\s*consultant|web\s*dev|contractor)\b/.test(text)) {
      profile.business_type = 'freelance_it';
    } else if (/\b(agency|marketing\s*agency|ad\s*agency|creative\s*agency|lead\s*gen\s*agency)\b/.test(text)) {
      profile.business_type = 'agency';
    } else if (/\b(logistics|freight|shipping\s*comp|cargo|transport|3pl|trucking)\b/.test(text)) {
      profile.business_type = 'logistics';
    } else if (/\b(trading|import|export|wholesale|distributor|general\s*trad)\b/.test(text)) {
      profile.business_type = 'trading';
    } else if (/\b(saas|software\s*development|b2b\s*software|app\s*dev)\b/.test(text)) {
      profile.business_type = 'saas_software';
    } else if (/\b(consulting|consultant|advisory)\b/.test(text)) {
      profile.business_type = 'consulting';
    }

    // 2. Residence Country Detection
    if (/\b(pakistan|pakistani|lahore|karachi|islamabad)\b/.test(text)) {
      profile.residence_country = 'Pakistan';
    } else if (/\b(india|indian|delhi|mumbai|bangalore)\b/.test(text)) {
      profile.residence_country = 'India';
    } else if (/\b(uae|dubai|abu\s*dhabi|emirates)\b/.test(text)) {
      profile.residence_country = 'UAE';
    } else if (/\b(bangladesh|dhaka)\b/.test(text)) {
      profile.residence_country = 'Bangladesh';
    } else if (/\b(morocco|moroccan|casablanca)\b/.test(text)) {
      profile.residence_country = 'Morocco';
    } else if (/\b(nigeria|nigerian|lagos)\b/.test(text)) {
      profile.residence_country = 'Nigeria';
    } else if (/\b(saudi|ksa|riyadh)\b/.test(text)) {
      profile.residence_country = 'Saudi Arabia';
    } else if (/\b(uk|united\s*kingdom|britain|england|london)\b/.test(text) && !text.includes('uk ltd') && !text.includes('open in uk')) {
      if (!profile.residence_country) profile.residence_country = 'UK';
    }

    // 3. Preferred Jurisdiction Detection (with pivot and negate awareness)
    const mentionsUk = /\b(uk\s*ltd|uk\s*company|\bltd\b|companies\s*house|in\s*the\s*uk|\bin\s*uk\b|uk\s*business|united\s*kingdom|\buk\b\s+(?:dropship\w*|ecommerce|e-commerce|store|company|business|market))\b/i.test(text) && !/\b(forget\s*uk|not\s*uk|instead\s*of\s*uk)\b/i.test(text);
    const mentionsUs = /\b(us\s*llc|usa\s*llc|\bllc\b|wyoming|delaware|new\s*mexico|montana|florida|texas|in\s*the\s*us|\bin\s*usa?\b|\b(us|usa|united\s*states)\s+(?:dropship\w*|ecommerce|e-commerce|store|company|business|market))\b/i.test(text) && !/\b(forget\s*us|not\s*us|instead\s*of\s*us)\b/i.test(text);
    
    if (mentionsUk && mentionsUs) {
      profile.preferred_jurisdiction = 'both';
    } else if (mentionsUk) {
      profile.preferred_jurisdiction = 'uk_ltd';
    } else if (mentionsUs) {
      profile.preferred_jurisdiction = 'us_llc';
    }

    // Detect specific US states
    if (text.includes('wyoming')) profile.us_state = 'Wyoming';
    if (text.includes('delaware')) profile.us_state = 'Delaware';
    if (text.includes('new mexico')) profile.us_state = 'New Mexico';
    if (text.includes('montana')) profile.us_state = 'Montana';
    if (text.includes('florida')) profile.us_state = 'Florida';
    if (text.includes('texas')) profile.us_state = 'Texas';

    // 4. Payment Requirements
    const payments = new Set(profile.payment_requirements || []);
    if (text.includes('stripe')) payments.add('stripe');
    if (text.includes('paypal')) payments.add('paypal');
    if (text.includes('mollie')) payments.add('mollie');
    if (text.includes('merchant')) payments.add('merchant_account');
    if (payments.size > 0) profile.payment_requirements = Array.from(payments);

    // 5. Banking Needs
    const banks = new Set(profile.banking_needs || []);
    if (text.includes('mercury')) banks.add('mercury');
    if (text.includes('relay')) banks.add('relay');
    if (text.includes('wise')) banks.add('wise');
    if (text.includes('payoneer')) banks.add('payoneer');
    if (text.includes('tide')) banks.add('tide');
    if (text.includes('airwallex')) banks.add('airwallex');
    if (text.includes('bank account') || text.includes('banking')) banks.add('business_account');
    if (banks.size > 0) profile.banking_needs = Array.from(banks);

    // 6. Formation Status
    if (/\b(already\s*have|already\s*registered|existing\s*company)\b/.test(text)) {
      profile.formation_status = 'registered';
    } else if (/\b(want\s*to\s*start|need\s*to\s*register|open\s*a\s*new|new\s*company|start\s*a\s*business)\b/.test(text)) {
      profile.formation_status = 'not_registered';
    }
  }

  return profile;
}

/**
 * Generates at least THREE highly contextual follow-up recommendations.
 * 
 * Rules:
 * 1. Must directly link to the customer's stated question, business profile, and next logical decision.
 * 2. Never generic.
 * 3. Never repeat suggestions already surfaced in previous turns.
 * 4. Grounded in DigiFormation's verified capabilities.
 */
export function generateBusinessFollowUps(params: FollowUpGenerationParams): BusinessFollowUpSuggestion[] {
  const { currentMessage, history = [], profile: initialProfile, previousSuggestions = [] } = params;
  const text = currentMessage.toLowerCase();
  const profile = initialProfile || extractBusinessProfile(history.concat({ role: 'user', content: currentMessage }));
  const prevSet = new Set(previousSuggestions.map((s) => s.toLowerCase().trim()));

  const candidates: BusinessFollowUpSuggestion[] = [];

  // ─────────────────────────────────────────────────────────────────
  // A. INTENT-SPECIFIC ROUTING (Matches user's direct focus)
  // ─────────────────────────────────────────────────────────────────

  // 1. AMAZON FBA / FBM SPECIFIC
  if (/\b(amazon|fba|fbm)\b/.test(text) || (profile.marketplace === 'amazon' && !text.includes('forget amazon'))) {
    candidates.push(
      {
        label: "Best LLC states for Amazon FBA sellers",
        prompt: "Which US LLC state (Wyoming, Delaware, or Montana) is best for non-resident Amazon FBA sellers?",
        category: "company_formation",
      },
      {
        label: "Recommend Amazon payout bank accounts",
        prompt: "Which business bank accounts (like Wise, Mercury, or Payoneer) link smoothly with Amazon Seller Central?",
        category: "banking",
      },
      {
        label: "Explain EIN, ITIN & tax compliance for Amazon",
        prompt: "What are the EIN, ITIN, and US tax filing requirements for non-resident Amazon sellers?",
        category: "tax_compliance",
      },
      {
        label: "Compare UK LTD vs US LLC for Amazon",
        prompt: "Should I use a UK LTD or a US LLC for selling on Amazon US and Amazon Europe?",
        category: "company_formation",
      }
    );
  }

  // 2. DROPSHIPPING SPECIFIC
  else if (/\b(drop\s*ship|dropshipping|dropshipper)\b/.test(text) || profile.fulfilment_model === 'dropshipping') {
    candidates.push(
      {
        label: "Compare UK LTD vs US LLC for dropshipping",
        prompt: "Should I form a UK LTD or a US LLC for an international dropshipping business?",
        category: "company_formation",
      },
      {
        label: "Recommend payment gateways for dropshippers",
        prompt: "Which payment gateways (Stripe, PayPal) have the best tolerance and approval rates for dropshipping?",
        category: "payments",
      },
      {
        label: "Explain tax & sales tax for dropshipping",
        prompt: "How does US sales tax and UK VAT work when dropshipping products to international customers?",
        category: "tax_compliance",
      },
      {
        label: "Best US states for dropshipping stores",
        prompt: "Which US state (Wyoming, New Mexico, or Montana) is most cost-effective for dropshipping?",
        category: "company_formation",
      }
    );
  }

  // 3. E-COMMERCE GENERAL (Shopify, eBay, Etsy, Walmart, online stores)
  else if (/\b(e-?commerce|shopify|ebay|etsy|walmart|online\s*store|sell\s*online)\b/.test(text) || profile.business_type === 'ecommerce') {
    candidates.push(
      {
        label: "Compare best US LLC states for e-commerce",
        prompt: "Based on my e-commerce business, which US LLC states are the most cost-effective and tax-friendly?",
        category: "company_formation",
      },
      {
        label: "Recommend marketplace bank accounts",
        prompt: "Which virtual business bank accounts (Wise, Payoneer, Mercury) are best suited for an e-commerce business?",
        category: "banking",
      },
      {
        label: "Compare UK LTD vs US LLC total costs",
        prompt: "Can you break down the setup, address, and ongoing maintenance costs of a UK LTD versus a US LLC?",
        category: "pricing",
      },
      {
        label: "Recommend e-commerce payment gateways",
        prompt: "What are the best payment gateway options (Stripe, PayPal, Mollie) for an international online store?",
        category: "payments",
      }
    );
  }

  // 4. IT FREELANCER / DEVELOPER / TECH CONTRACTOR
  else if (/\b(freelanc|it\s*freelancer|developer|programmer|software\s*eng|contractor|tech\s*consultant)\b/.test(text) || profile.business_type === 'freelance_it') {
    candidates.push(
      {
        label: "Best business accounts for IT freelancers",
        prompt: "What are the best virtual business accounts for IT freelancers to receive client wires without high fees?",
        category: "banking",
      },
      {
        label: "Compare PayPal, Stripe, Wise & Payoneer",
        prompt: "How do PayPal, Stripe, Wise, and Payoneer compare for invoicing international tech clients?",
        category: "payments",
      },
      {
        label: "Calculate UK LTD vs US LLC setup costs",
        prompt: "Show the formation costs and annual compliance differences between a UK LTD and a US LLC for a freelancer.",
        category: "pricing",
      },
      {
        label: "Tax efficiency for remote developers",
        prompt: "How does corporate tax work for a foreign software developer operating a UK LTD or US single-member LLC?",
        category: "tax_compliance",
      }
    );
  }

  // 5. TRADING / WHOLESALE / IMPORT & EXPORT
  else if (/\b(trading|import|export|wholesale|distributor|general\s*trad)\b/.test(text) || profile.business_type === 'trading') {
    candidates.push(
      {
        label: "Best jurisdiction for trading & wholesale",
        prompt: "Which company structure and jurisdiction is best suited for an international trading and wholesale business?",
        category: "company_formation",
      },
      {
        label: "Compare international business banking",
        prompt: "Which global business banks offer multi-currency multi-signatory capabilities for cross-border trading?",
        category: "banking",
      },
      {
        label: "Company structure for import & export",
        prompt: "How should an import/export trading company be structured for customs, VAT, and international contracts?",
        category: "tax_compliance",
      },
      {
        label: "Letter of Credit & trade finance support",
        prompt: "What banking and corporate address solutions do international trading companies need for trade compliance?",
        category: "banking",
      }
    );
  }

  // 6. LOGISTICS / FREIGHT / SHIPPING
  else if (/\b(logistics|freight|shipping|cargo|transport|3pl|trucking)\b/.test(text) || profile.business_type === 'logistics') {
    candidates.push(
      {
        label: "Best company structure for freight & logistics",
        prompt: "What is the best legal entity structure for a freight forwarding, cargo, and logistics business?",
        category: "company_formation",
      },
      {
        label: "Recommend commercial banking for logistics",
        prompt: "Which business banks best handle high-frequency international vendor payouts and customs disbursements?",
        category: "banking",
      },
      {
        label: "Compare liability & commercial address requirements",
        prompt: "What corporate liability protection, registered office, and carrier compliance rules apply to logistics companies?",
        category: "tax_compliance",
      },
      {
        label: "Calculate UK vs US registration costs for logistics",
        prompt: "Compare the formation packages and annual compliance costs for a logistics firm in the UK and USA.",
        category: "pricing",
      }
    );
  }

  // 7. PAYPAL SPECIFIC
  else if (/\b(paypal)\b/.test(text)) {
    candidates.push(
      {
        label: "Requirements to open verified PayPal Business",
        prompt: "What company documents, tax IDs, and commercial address proof are needed to verify PayPal Business?",
        category: "payments",
      },
      {
        label: "UK LTD vs US LLC for PayPal approval",
        prompt: "Is a UK LTD or a US LLC better for getting seamless, long-term PayPal Business account approval?",
        category: "payments",
      },
      {
        label: "How to prevent PayPal holds & rolling reserves",
        prompt: "What steps should international sellers take to avoid sudden account limitations or reserves on PayPal?",
        category: "payments",
      },
      {
        label: "Compare PayPal fees with Stripe & Wise",
        prompt: "How do PayPal transaction fees compare with Stripe and Wise for international payouts?",
        category: "payments",
      }
    );
  }

  // 8. STRIPE SPECIFIC
  else if (/\b(stripe)\b/.test(text)) {
    candidates.push(
      {
        label: "UK LTD vs US LLC for Stripe approval",
        prompt: "Should I register a UK LTD or a US LLC to get approved for Stripe payment processing?",
        category: "payments",
      },
      {
        label: "Why a unique commercial address is required",
        prompt: "Why does Stripe reject virtual shared mailbox addresses and require DigiFormation's Silver unique commercial address?",
        category: "payments",
      },
      {
        label: "How to connect Stripe to Shopify without bans",
        prompt: "What is the step-by-step process to connect a verified Stripe gateway to a Shopify or custom store?",
        category: "ecommerce",
      },
      {
        label: "Stripe verification documents for non-residents",
        prompt: "What exact identity and corporate documents does Stripe request during non-resident account verification?",
        category: "payments",
      }
    );
  }

  // 9. BUSINESS BANKING SPECIFIC
  else if (/\b(bank|banking|mercury|relay|wise|payoneer|tide|airwallex|account\s*approval)\b/.test(text)) {
    candidates.push(
      {
        label: "Can non-residents open Mercury or Relay remotely?",
        prompt: "Can overseas founders legally open a US FDIC-insured account with Mercury Bank or Relay Financial remotely?",
        category: "banking",
      },
      {
        label: "Compare Wise Business, Payoneer & Airwallex",
        prompt: "How do Wise Business, Payoneer, and Airwallex compare for international currency exchange and payouts?",
        category: "banking",
      },
      {
        label: "What documents are required for bank approval?",
        prompt: "What corporate documents, address proof, and ID checks are required for business account approval?",
        category: "banking",
      },
      {
        label: "How long does business bank approval take?",
        prompt: "What are the realistic approval timelines for Wise, Mercury, Tide, and Payoneer accounts in 2026?",
        category: "banking",
      }
    );
  }

  // 10. PRICING / PACKAGES SPECIFIC
  else if (/\b(price|pricing|cost|costs|package|packages|starter|silver|gold|how\s*much)\b/.test(text)) {
    candidates.push(
      {
        label: "Show UK LTD packages (Starter vs Silver)",
        prompt: "Show the full breakdown of UK LTD packages from Starter £140 to Silver £170 and what each includes.",
        category: "pricing",
      },
      {
        label: "Show US LLC pricing for Wyoming & New Mexico",
        prompt: "What are your Starter, Silver, and Gold package prices for Wyoming, New Mexico, Montana, and Delaware LLCs?",
        category: "pricing",
      },
      {
        label: "What are ongoing annual renewal & tax costs?",
        prompt: "What are the annual state report fees, registered office renewals, and tax return filing costs after year one?",
        category: "pricing",
      },
      {
        label: "Why is Silver the recommended package?",
        prompt: "Why does DigiFormation recommend the Silver package for both UK LTD and US LLC formations?",
        category: "pricing",
      }
    );
  }

  // 11. UK LTD SPECIFIC
  else if (/\b(uk\s*ltd|uk\s*company|companies\s*house|england|wales|scotland)\b/.test(text) || profile.preferred_jurisdiction === 'uk_ltd') {
    candidates.push(
      {
        label: "Compare Starter (£140) vs Silver (£170)",
        prompt: "What is the difference between the UK LTD Starter (£140) and Silver (£170) packages, and why is Silver recommended?",
        category: "pricing",
      },
      {
        label: "Companies House ID verification rules (£20)",
        prompt: "How does Companies House director and PSC identity verification work under ECCTA 2023?",
        category: "company_formation",
      },
      {
        label: "How to open Wise or Tide with UK LTD",
        prompt: "What are the steps and approval requirements to open a UK business account with Wise or Tide after formation?",
        category: "banking",
      },
      {
        label: "What is HMRC UTR and Auth Code?",
        prompt: "How do I get my HMRC Unique Taxpayer Reference (UTR) and Companies House WebFiling authentication code?",
        category: "tax_compliance",
      }
    );
  }

  // 12. US LLC SPECIFIC
  else if (/\b(us\s*llc|usa\s*llc|wyoming|delaware|new\s*mexico|montana|florida|texas)\b/.test(text) || profile.preferred_jurisdiction === 'us_llc') {
    candidates.push(
      {
        label: "Wyoming vs Delaware vs New Mexico comparison",
        prompt: "Compare Wyoming, Delaware, and New Mexico for a non-resident US LLC in terms of privacy, taxes, and fees.",
        category: "company_formation",
      },
      {
        label: "Explain EIN & ITIN requirements",
        prompt: "How do foreign founders get an EIN and ITIN without a Social Security Number (SSN)?",
        category: "tax_compliance",
      },
      {
        label: "Calculate total LLC formation & state fees",
        prompt: "Show the Starter, Silver, and Gold package prices across top states like Wyoming, Montana, and New Mexico.",
        category: "pricing",
      },
      {
        label: "How does single-member foreign LLC tax work?",
        prompt: "Do non-resident owners of a US LLC pay US federal income tax, and what IRS forms must be filed annually?",
        category: "tax_compliance",
      }
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // B. GENERAL DISCOVERY / BROADER FALLBACKS
  // ─────────────────────────────────────────────────────────────────
  if (candidates.length < 3) {
    // If jurisdiction is unknown, offer comparison
    if (!profile.preferred_jurisdiction) {
      candidates.push({
        label: "Compare UK LTD vs US LLC",
        prompt: "Which is better for my business model: a UK Limited Company or a US Limited Liability Company?",
        category: "company_formation",
      });
    }

    // Always offer banking recommendation
    candidates.push({
      label: "Find the best business banking options",
      prompt: "Recommend suitable virtual business accounts for my business and country of residence.",
      category: "banking",
    });

    // Formation pricing
    candidates.push({
      label: "Calculate my company formation costs",
      prompt: "Show the Starter, Silver and Gold package prices for the most suitable company structure.",
      category: "pricing",
    });

    // Open Source / Automation (DigiBizOS)
    candidates.push({
      label: "How to save $5,000/yr with DigiBizOS",
      prompt: "How can I use DigiBizOS open-source software to manage my business CRM, invoicing, and workflows for free?",
      category: "business_development",
    });
  }

  // Filter out previous suggestions and duplicates
  const finalSuggestions: BusinessFollowUpSuggestion[] = [];
  const seenLabels = new Set<string>();

  for (const c of candidates) {
    const key = c.label.toLowerCase().trim();
    if (!seenLabels.has(key) && !prevSet.has(key)) {
      seenLabels.add(key);
      finalSuggestions.push(c);
      if (finalSuggestions.length === 3) break;
    }
  }

  // If filtered down to less than 3, backfill with clean fallbacks
  const fallbacks: BusinessFollowUpSuggestion[] = [
    {
      label: "Compare UK LTD vs US LLC",
      prompt: "Which is better for my business model: a UK Limited Company or a US Limited Liability Company?",
      category: "company_formation",
    },
    {
      label: "Find best business banking options",
      prompt: "Recommend suitable virtual business accounts for my business and country of residence.",
      category: "banking",
    },
    {
      label: "Calculate company formation costs",
      prompt: "Show the Starter, Silver and Gold package prices for the most suitable company structure.",
      category: "pricing",
    },
    {
      label: "Explain EIN and ITIN requirements",
      prompt: "How do foreign founders get an EIN and ITIN without a Social Security Number (SSN)?",
      category: "tax_compliance",
    },
  ];

  for (const fb of fallbacks) {
    if (finalSuggestions.length >= 3) break;
    const key = fb.label.toLowerCase().trim();
    if (!seenLabels.has(key)) {
      seenLabels.add(key);
      finalSuggestions.push(fb);
    }
  }

  return finalSuggestions.slice(0, 3);
}
