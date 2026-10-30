export type TopicLink = { path: string; label: string };
export type BlogTopic = { id: string; title: string; pillar: string; links: TopicLink[] };
const uk: TopicLink = { path: '/uk-services/uk-ltd-formation', label: 'UK limited company formation support' };
const us: TopicLink = { path: '/usa-services/us-llc-formation', label: 'US LLC formation support' };
const web: TopicLink = { path: '/web-development', label: 'Website and e-commerce development' };
const software: TopicLink = { path: '/software-development', label: 'Software development and AI automation' };
const providers: Record<string, string> = { Stripe: 'stripe', PayPal: 'paypal', Tide: 'tide', Wise: 'wise', PingPong: 'pingpong', WorldFirst: 'worldfirst', Mollie: 'mollie', Wallester: 'wallester' };

/** Editorial relevance rules, not inferred country demand or service eligibility. */
export function blogTopicFor(post: { slug: string; category: string }): BlogTopic {
  const provider = Object.prototype.hasOwnProperty.call(providers, post.category) ? providers[post.category] : undefined;
  if (provider) {
    const links = [{ path: `/banks-payment-solutions/${provider}`, label: `${post.category} application guidance` }];
    if (/shopify|store|ecommerce/i.test(post.slug)) links.push(web);
    return { id: 'payments', title: 'Banking and payment applications', pillar: '/banks-payment-solutions', links };
  }
  if (post.category === 'UK Formation') return { id: 'uk-formation', title: 'UK company formation', pillar: uk.path, links: [uk, { path: '/uk-services/ltd-id-verification', label: 'Company identity verification information' }, { path: '/uk-services/registered-office-address', label: 'Registered office address service' }] };
  if (post.category === 'USA Formation' || post.category === 'State Jurisdictions' || post.category === 'Taxation' || (post.category === 'Compliance' && /boi|ein|itin|us-llc|usa/.test(post.slug)) || /itin|ein|us-llc|wyoming/.test(post.slug)) return { id: 'us-formation', title: 'US formation and filing considerations', pillar: us.path, links: [us, { path: '/usa-services/ein-number', label: 'EIN application assistance' }] };
  if (post.category === 'UK Compliance' || post.category === 'Compliance') return { id: 'uk-compliance', title: 'UK company filings and access', pillar: '/uk-compliance', links: [{ path: '/uk-compliance', label: 'UK company compliance services' }, { path: '/uk-services/utr-codes', label: 'UTR and company-code guidance' }] };
  if (post.category === 'Banking' || post.category === 'Payments' || post.category === 'Payment Gateways') return { id: 'payments', title: 'Banking and payment applications', pillar: '/banks-payment-solutions', links: [{ path: '/banks-payment-solutions', label: 'Banking and payment application support' }] };
  if (['E-commerce', 'Web Development', '3D Web', 'Web Performance', 'Motion Web', 'Amazon FBA', 'Dropshipping'].includes(post.category)) return { id: 'web', title: 'Websites and e-commerce', pillar: web.path, links: [web] };
  if (['Open Source AI', 'Open Source', 'Software Engineering', 'AI & Automation'].includes(post.category)) return { id: 'software', title: 'Software and automation', pillar: software.path, links: [software] };
  if (post.category === 'Founder Story') return { id: 'company', title: 'About DigiFormation', pillar: '/about', links: [{ path: '/about', label: 'About DigiFormation' }] };
  return { id: 'general', title: 'Business guides', pillar: '/blog', links: [{ path: '/blog', label: 'Browse business guides' }] };
}
