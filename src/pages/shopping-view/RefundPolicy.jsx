import React from 'react';
import { motion } from 'framer-motion';

// RefundPolicy.jsx
// Vite + React + Tailwind + Framer Motion
// Premium, print-friendly Refund Policy inner page for Aachiamma Foods
// Updated to match the Terms/Privacy layout: sticky TOC, roomy spacing, print-friendly "trim" feel.
// Usage: import RefundPolicy from './RefundPolicy'; <RefundPolicy accent="#08665F" />

export default function RefundPolicy({ accent = '#08665F' }) {
  const sections = [
    { id: 'intro', title: 'Overview' },
    { id: 'eligibility', title: 'Eligibility for Refunds' },
    { id: 'process', title: 'Refund Request Process' },
    { id: 'method', title: 'Refund Method' },
    { id: 'non-refundable', title: 'Non-Refundable Items' },
    { id: 'cancellations', title: 'Cancellations' },
    { id: 'contact', title: 'Contact Information' }
  ];

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className="w-full bg-white text-gray-900 py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: 'rgba(8,102,95,0.06)', color: accent }}>
                Refunds
              </span>
            </div>

            <h1 className="mt-6 text-3xl md:text-4xl font-extrabold leading-tight">Refund Policy</h1>
            <p className="mt-4 text-gray-600 text-base max-w-3xl mx-auto leading-relaxed">Effective Date: <strong>1st April 2025</strong></p>

            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-500">
              <button onClick={() => window.print()} className="px-3 py-1 rounded-full border" style={{ borderColor: 'rgba(8,102,95,0.08)' }}>
                Print / Save as PDF
              </button>
              <a href="mailto:info@aachiammafoods.com" className="underline">Contact: info@aachiammafoods.com</a>
            </div>
          </div>
        </motion.header>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* TOC */}
          <aside className="hidden md:block md:col-span-1 sticky top-24 h-[calc(100vh-6rem)] overflow-auto pb-6">
            <div className="rounded-2xl border p-6 bg-white shadow-sm">
              <div className="text-xs text-gray-400">On this page</div>
              <nav className="mt-4 flex flex-col gap-2 text-sm">
                {sections.map((s) => (
                  <button key={s.id} onClick={() => scrollToId(s.id)} className="text-left hover:text-[rgba(8,102,95,1)] focus:outline-none">
                    <div className="text-gray-700">{s.title}</div>
                  </button>
                ))}
              </nav>

              <div className="mt-6 text-xs text-gray-400">Last updated: <span className="font-medium text-gray-600">1st April 2025</span></div>
            </div>
          </aside>

          {/* Content */}
          <main className="md:col-span-3 space-y-8">
            <article className="rounded-2xl border p-10 bg-white shadow-lg prose prose-lg max-w-none">
              <section id="intro">
                <p>At <strong>Aachiamma Foods</strong>, we strive to ensure customer satisfaction with every purchase. If you are not satisfied with your order, please review the eligibility and process below.</p>
              </section>

              <hr className="my-6" />

              <section id="eligibility">
                <h3>1. Eligibility for Refunds</h3>
                <p>We accept refund requests under the following conditions:</p>
                <ul>
                  <li>The product was received in a defective or damaged condition.</li>
                  <li>The wrong product was delivered.</li>
                  <li>The product is missing from the order.</li>
                </ul>
              </section>

              <hr className="my-6" />

              <section id="process">
                <h3>2. Refund Request Process</h3>
                <p>To request a refund, please follow these steps:</p>
                <ol>
                  <li>Contact us at <a href="mailto:info@aachiammafoods.com" className="underline">info@aachiammafoods.com</a> within <strong>24 hours</strong> of receiving the order.</li>
                  <li>Provide your order details, proof of purchase, and clear photos of the defective or incorrect product.</li>
                  <li>Our team will review your request and notify you of the approval or rejection.</li>
                </ol>
              </section>

              <hr className="my-6" />

              <section id="method">
                <h3>3. Refund Method</h3>
                <p>Approved refunds will be processed within <strong>7 to 10 working days</strong>. Refunds will generally be issued to the original payment method used for the purchase or another mutually convenient method. Please note that additional time may be required for the refund to reflect in your account depending on your bank or payment provider.</p>
              </section>

              <hr className="my-6" />

              <section id="non-refundable">
                <h3>4. Non-Refundable Items</h3>
                <p>Refunds will not be issued in the following cases:</p>
                <ul>
                  <li>Products that have been used, altered, or tampered with.</li>
                  <li>Requests made after the refund timeframe has passed.</li>
                  <li>Orders placed by mistake or for change of mind.</li>
                </ul>
              </section>

              <hr className="my-6" />

              <section id="cancellations">
                <h3>5. Cancellations</h3>
                <p>Orders can be canceled only before they are shipped. Once an order is shipped, it cannot be canceled. Cancellations must be requested within <strong>two hours</strong> of placing the order — contact our customer support immediately for assistance.</p>
              </section>

              <hr className="my-6" />

              <section id="contact">
                <h3>6. Contact Information</h3>
                <p>If you have any refund-related inquiries, please reach out:</p>
                <p>
                  Website: <a href="https://www.aachiammafoods.com" className="underline">www.aachiammafoods.com</a><br />
                  Email: <a href="mailto:info@aachiammafoods.com" className="underline">info@aachiammafoods.com</a><br />
                  Phone: <a href="tel:+917356428330" className="underline">+91 7356 428 330</a>
                </p>
              </section>

              <div className="mt-6 text-sm text-gray-500">Effective Date: 1st April 2025</div>
            </article>

            <div className="text-center text-sm text-gray-600">Questions or concerns? Email us at <a href="mailto:info@aachiammafoods.com" className="underline">info@aachiammafoods.com</a>.</div>
          </main>
        </div>
      </div>
    </section>
  );
}