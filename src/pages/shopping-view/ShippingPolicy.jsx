import React from 'react';
import { motion } from 'framer-motion';


export default function ShippingPolicy({ accent = '#08665F' }) {
  const sections = [
    { id: 'charges', title: 'Shipping Charges' },
    { id: 'coverage', title: 'Coverage' },
    { id: 'timelines', title: 'Delivery Timelines' },
    { id: 'qa', title: 'Basic Q & A' },
    { id: 'returns', title: 'Return Policy' },
    { id: 'contact', title: 'Contact' }
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
                Shipping
              </span>
            </div>

            <h1 className="mt-6 text-3xl md:text-4xl font-extrabold leading-tight">Shipping Policy</h1>
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

          <main className="md:col-span-3 space-y-8">
            <article className="rounded-2xl border p-10 bg-white shadow-lg prose prose-lg max-w-none">
              <section id="charges">
                <h3>Shipping Charges</h3>
                <ul>
                  <li>Prepaid Orders / Online Payment: Standard Shipping Charges ₹79 — South India (Kerala, Tamil Nadu, Karnataka, Telangana, Andhra Pradesh, Pondicherry).</li>
                  <li>Prepaid Orders / Online Payment: Standard Shipping Charges ₹99 — North & Central India (Punjab, Haryana, Uttarakhand, Delhi, Uttar Pradesh, Bihar, Jharkhand, Odisha, West Bengal, Rajasthan, Gujarat, Maharashtra, Goa, Madhya Pradesh, Chhattisgarh).</li>
                  <li>Prepaid Orders / Online Payment: Mandatory Standard Shipping Charges ₹119 — Special Destinations (Andaman & Nicobar Islands, Arunachal Pradesh, Assam, Dadra and Nagar Haveli, Daman and Diu, Himachal Pradesh, Jammu & Kashmir, Ladakh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura, Chandigarh, Lakshadweep).</li>
                </ul>
              </section>

              <hr className="my-6" />

              <section id="coverage">
                <h3>Coverage</h3>
                <p>Yes — we ship across India and to select international destinations where applicable. International shipping availability, rates, and timelines vary by country and will be displayed at checkout when enabled.</p>
              </section>

              <hr className="my-6" />

              <section id="timelines">
                <h3>Delivery Timelines (from dispatch)</h3>
                <ul>
                  <li><strong>Kerala:</strong> 2–3 working days</li>
                  <li><strong>South India:</strong> 3–4 working days</li>
                  <li><strong>North India:</strong> 4–6 working days</li>
                  <li><strong>Special Destinations:</strong> 5–7 working days</li>
                </ul>
                <p className="text-xs text-gray-500">Timelines are estimates and may vary due to carrier delays, public holidays, or force majeure events.</p>
              </section>

              <hr className="my-6" />

              <section id="qa">
                <h3>Basic Q &amp; A</h3>

                <h4 className="mt-2">How do I cancel an order?</h4>
                <p>Cancellation is possible only before an order is shipped. Please call our customer support immediately — cancellations must be requested within <strong>two hours</strong> of placing the order.</p>

                <h4 className="mt-2">How long do I have to report a complaint?</h4>
                <p>Report any complaint within <strong>24 hours</strong> from the date of delivery. Complaints should include clear photographs and details; we will verify and respond accordingly.</p>

                <h4 className="mt-2">Can I request Proof of Delivery (POD)?</h4>
                <p>Yes — Proof of Delivery can be requested and will be provided within two working days from the request date. Note: PODs are available only for <strong>3 working days</strong> from the delivery date.</p>

                <h4 className="mt-2">What happens on national holidays?</h4>
                <p>Orders are not processed or dispatched on national holidays. Delivery timelines will be adjusted accordingly.</p>
              </section>

              <hr className="my-6" />

              <section id="returns">
                <h3>Return Policy</h3>
                <p className="font-semibold">Our Sincere Apologies — Returns Are Not Applicable for Perishable Goods</p>
                <p>Because our products are freshly prepared perishable food items, we cannot accept returns for taste, preference, or change-of-mind. We do accept claims for the following situations:</p>
                <ul>
                  <li>Product received in defective or damaged condition</li>
                  <li>Wrong product delivered</li>
                  <li>Product missing from the order</li>
                </ul>
                <p>Please follow the refund/replacement process described on our Refund Policy page. For perishable goods, we prioritize verifying claims quickly — please provide photos and order details when contacting us.</p>
              </section>

              <hr className="my-6" />

              <section id="contact">
                <h3>Contact</h3>
                <p>
                  For shipping or delivery inquiries, contact us at:<br />
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