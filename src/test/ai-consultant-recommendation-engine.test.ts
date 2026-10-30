import { describe, expect, it } from 'vitest';
import {
  extractBusinessProfile,
  generateBusinessFollowUps,
  type BusinessProfile,
} from '@/lib/ai/recommendationEngine';

describe('DigiFormation Ask AI — Proactive Business Consultant & Smart Follow-Up Engine', () => {
  // Scenario 1: Customer asks only about e-commerce
  it('Scenario 1: generates relevant follow-ups for general e-commerce inquiries', () => {
    const message = 'I run an e-commerce business. Should I open my company in the UK or USA?';
    const profile = extractBusinessProfile([{ role: 'user', content: message }]);
    expect(profile.business_type).toBe('ecommerce');

    const suggestions = generateBusinessFollowUps({
      currentMessage: message,
      profile,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /US LLC states/i.test(l))).toBe(true);
    expect(labels.some((l) => /marketplace bank accounts|payment gateways/i.test(l))).toBe(true);
    expect(labels.some((l) => /UK LTD vs US LLC/i.test(l))).toBe(true);
  });

  // Scenario 2: Customer asks about Amazon
  it('Scenario 2: generates Amazon-focused follow-ups for Amazon FBA/FBM sellers', () => {
    const message = 'I want to sell products on Amazon FBA from Pakistan. What is required?';
    const profile = extractBusinessProfile([{ role: 'user', content: message }]);
    expect(profile.business_type).toBe('ecommerce');
    expect(profile.marketplace).toBe('amazon');
    expect(profile.fulfilment_model).toBe('fba');
    expect(profile.residence_country).toBe('Pakistan');

    const suggestions = generateBusinessFollowUps({
      currentMessage: message,
      profile,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /Amazon FBA/i.test(l))).toBe(true);
    expect(labels.some((l) => /Amazon payout/i.test(l))).toBe(true);
    expect(labels.some((l) => /EIN, ITIN/i.test(l))).toBe(true);
  });

  // Scenario 3: Customer asks about IT freelancing
  it('Scenario 3: generates developer-friendly banking and gateway follow-ups for IT freelancers', () => {
    const message = 'I work in IT and receive payments from international clients. Which company should I open?';
    const profile = extractBusinessProfile([{ role: 'user', content: message }]);
    expect(profile.business_type).toBe('freelance_it');

    const suggestions = generateBusinessFollowUps({
      currentMessage: message,
      profile,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /IT freelancers/i.test(l))).toBe(true);
    expect(labels.some((l) => /PayPal, Stripe, Wise/i.test(l))).toBe(true);
    expect(labels.some((l) => /formation.*cost|setup cost/i.test(l))).toBe(true);
  });

  // Scenario 4: Customer asks about a trading company
  it('Scenario 4: generates trade, import/export, and multi-currency follow-ups for trading companies', () => {
    const message = 'I operate a general trading and wholesale import business.';
    const profile = extractBusinessProfile([{ role: 'user', content: message }]);
    expect(profile.business_type).toBe('trading');

    const suggestions = generateBusinessFollowUps({
      currentMessage: message,
      profile,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /trading & wholesale/i.test(l))).toBe(true);
    expect(labels.some((l) => /international business banking/i.test(l))).toBe(true);
    expect(labels.some((l) => /import & export/i.test(l))).toBe(true);
  });

  // Scenario 5: Customer asks about logistics
  it('Scenario 5: generates entity, liability, and commercial banking follow-ups for logistics firms', () => {
    const message = 'We are establishing a global freight forwarding and cargo logistics service.';
    const profile = extractBusinessProfile([{ role: 'user', content: message }]);
    expect(profile.business_type).toBe('logistics');

    const suggestions = generateBusinessFollowUps({
      currentMessage: message,
      profile,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /freight & logistics/i.test(l))).toBe(true);
    expect(labels.some((l) => /commercial banking for logistics/i.test(l))).toBe(true);
    expect(labels.some((l) => /liability/i.test(l))).toBe(true);
  });

  // Scenario 6: Customer asks about UK LTD
  it('Scenario 6: generates UK package comparison, ID verification, and banking follow-ups for UK LTD', () => {
    const message = 'How do I register a UK LTD company?';
    const profile = extractBusinessProfile([{ role: 'user', content: message }]);
    expect(profile.preferred_jurisdiction).toBe('uk_ltd');

    const suggestions = generateBusinessFollowUps({
      currentMessage: message,
      profile,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /Starter.*Silver/i.test(l))).toBe(true);
    expect(labels.some((l) => /ID verification/i.test(l))).toBe(true);
    expect(labels.some((l) => /Wise or Tide/i.test(l))).toBe(true);
  });

  // Scenario 7: Customer asks about US LLC
  it('Scenario 7: generates state comparison, EIN/ITIN, and total fee follow-ups for US LLC', () => {
    const message = 'Can foreign residents form a US LLC?';
    const profile = extractBusinessProfile([{ role: 'user', content: message }]);
    expect(profile.preferred_jurisdiction).toBe('us_llc');

    const suggestions = generateBusinessFollowUps({
      currentMessage: message,
      profile,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /Wyoming.*Delaware.*New Mexico/i.test(l))).toBe(true);
    expect(labels.some((l) => /EIN & ITIN/i.test(l))).toBe(true);
    expect(labels.some((l) => /total LLC formation/i.test(l))).toBe(true);
  });

  // Scenario 8: Customer asks only about business banking
  it('Scenario 8: generates remote fintech eligibility, multi-currency, and document follow-ups for banking', () => {
    const message = 'Which business bank accounts do you support for non-residents?';
    const suggestions = generateBusinessFollowUps({
      currentMessage: message,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /Mercury or Relay/i.test(l))).toBe(true);
    expect(labels.some((l) => /Wise Business, Payoneer/i.test(l))).toBe(true);
    expect(labels.some((l) => /documents are required/i.test(l))).toBe(true);
  });

  // Scenario 9: Customer asks about PayPal
  it('Scenario 9: generates entity structure, address verification, and hold prevention follow-ups for PayPal', () => {
    const message = 'Can you help me get a verified PayPal business account?';
    const suggestions = generateBusinessFollowUps({
      currentMessage: message,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /PayPal Business/i.test(l))).toBe(true);
    expect(labels.some((l) => /UK LTD vs US LLC for PayPal/i.test(l))).toBe(true);
    expect(labels.some((l) => /holds & rolling reserves/i.test(l))).toBe(true);
  });

  // Scenario 10: Customer asks about Stripe
  it('Scenario 10: generates entity comparison, unique commercial address, and Shopify linking follow-ups for Stripe', () => {
    const message = 'I need a Stripe account to take credit cards online.';
    const suggestions = generateBusinessFollowUps({
      currentMessage: message,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /UK LTD vs US LLC for Stripe/i.test(l))).toBe(true);
    expect(labels.some((l) => /unique commercial address/i.test(l))).toBe(true);
    expect(labels.some((l) => /Stripe to Shopify/i.test(l))).toBe(true);
  });

  // Scenario 11: Customer asks about company formation pricing
  it('Scenario 11: generates UK, US state, and annual renewal cost follow-ups for pricing inquiries', () => {
    const message = 'What are your prices for company formation packages?';
    const suggestions = generateBusinessFollowUps({
      currentMessage: message,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /UK LTD packages/i.test(l))).toBe(true);
    expect(labels.some((l) => /US LLC pricing/i.test(l))).toBe(true);
    expect(labels.some((l) => /annual renewal/i.test(l))).toBe(true);
  });

  // Scenario 12: Customer changes business requirements midway through conversation
  it('Scenario 12: dynamically updates profile and adapts recommendations when customer pivots mid-conversation', () => {
    // Turn 1: Freelancing in UK
    const turn1: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: 'I am a web developer freelancing for UK clients and want a UK LTD.' },
      { role: 'assistant', content: 'A UK LTD is great for freelancing with 24h setup.' },
    ];
    let profile = extractBusinessProfile(turn1);
    expect(profile.business_type).toBe('freelance_it');
    expect(profile.preferred_jurisdiction).toBe('uk_ltd');

    // Turn 2: Pivot completely to dropshipping in USA!
    const turn2 = [
      ...turn1,
      { role: 'user', content: 'Actually forget freelancing. I have decided to start a US dropshipping store instead.' },
    ];
    profile = extractBusinessProfile(turn2, profile);

    // Profile must reflect the pivot
    expect(profile.business_type).toBe('ecommerce');
    expect(profile.fulfilment_model).toBe('dropshipping');
    expect(profile.preferred_jurisdiction).toBe('us_llc');

    // Follow-ups must now reflect US dropshipping, NOT UK freelancing!
    const suggestions = generateBusinessFollowUps({
      currentMessage: 'Actually forget freelancing. I have decided to start a US dropshipping store instead.',
      history: turn2,
      profile,
    });

    expect(suggestions).toHaveLength(3);
    const labels = suggestions.map((s) => s.label);
    expect(labels.some((l) => /dropshipping/i.test(l))).toBe(true);
    expect(labels.some((l) => /payment gateways for dropshippers/i.test(l))).toBe(true);
    expect(labels.some((l) => /tax.*sales tax/i.test(l))).toBe(true);
    // Should NOT have freelance developer chips
    expect(labels.some((l) => /IT freelancers/i.test(l))).toBe(false);
  });

  // Deduplication Test: Never show previously shown suggestions
  it('prevents repeating previously displayed suggestions across turns', () => {
    const message = 'I want to sell products on Amazon FBA.';
    const firstTurn = generateBusinessFollowUps({
      currentMessage: message,
    });
    expect(firstTurn).toHaveLength(3);

    // Pass the first turn suggestions as previously shown
    const secondTurn = generateBusinessFollowUps({
      currentMessage: message,
      previousSuggestions: firstTurn.map((s) => s.label),
    });

    expect(secondTurn).toHaveLength(3);
    const firstLabels = new Set(firstTurn.map((s) => s.label));
    for (const s of secondTurn) {
      expect(firstLabels.has(s.label)).toBe(false);
    }
  });
});
