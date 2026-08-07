import React from 'react';
import { motion } from 'framer-motion';

export default function LegalPolicy({ accent = '#08665F' }) {
  const sections = [
    { id: 'general', title: 'General' },
    { id: 'how-collect', title: 'How we collect information' },
    { id: 'what-collect', title: 'Information we collect' },
    { id: 'how-use', title: 'How we use information' },
    { id: 'data-transfer', title: 'Data transfer' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'data-security', title: 'Data security' },
    { id: 'third-party', title: 'Links to third-party sites' },
    { id: 'social-plugins', title: 'Social network plugins' },
    { id: 'sharing', title: 'Sharing of personal information' },
    { id: 'children', title: 'Children' },
    { id: 'changes', title: 'Changes to this policy' },
    { id: 'newsletter', title: 'Newsletter' },
    { id: 'contact', title: 'Contact details' }
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
                Privacy
              </span>
            </div>

            <h1 className="mt-6 text-3xl md:text-4xl font-extrabold leading-tight">Privacy Policy</h1>
            <p className="mt-4 text-gray-600 text-base max-w-3xl mx-auto leading-relaxed">Effective date: <strong>June 15th, 2025</strong></p>

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

              <div className="mt-6 text-xs text-gray-400">Last updated: <span className="font-medium text-gray-600">June 15th, 2025</span></div>
            </div>
          </aside>

          <main className="md:col-span-3 space-y-8">
            <article className="rounded-2xl border p-10 bg-white shadow-lg prose prose-lg max-w-none">
              <section id="general">
                <h2>General</h2>
                <p>
                  This website, accessible via <strong>www.aachiammafoods.com</strong> ("Website/Site"), is operated by <strong>Manju Gopinath</strong> ("We/Our/Us"). We are dedicated to safeguarding and upholding your privacy. We gather and handle your personal data in line with the IT Act, 2000 (21 of 2000), and other applicable national and state data protection laws. Kindly review the following carefully to understand our approach to your personal data.
                </p>
                <p>
                  We collect your personal data to enhance and deliver our products and services more effectively. Our privacy policy may be modified at any time without prior notice. To stay informed of any updates, please review this policy periodically.
                </p>
                <p>
                  All associated firms and third-party collaborators working with or on behalf of Us, who have access to personal data, are required to understand and adhere to this policy. No third party is allowed to access or process sensitive personal data without entering into a confidentiality agreement with Us.
                </p>
              </section>

              <hr className="my-6" />

              <section id="how-collect">
                <h3>How we collect the information</h3>
                <p>
                  We collect information directly from you when you interact with the Site, through business interactions, and from additional sources such as public records, co-marketing partners, social media platforms, and other third-party services. Examples include updated delivery/contact details from couriers and information regarding interactions with affiliate services.
                </p>
              </section>

              <hr className="my-6" />

              <section id="what-collect">
                <h3>Information we collect</h3>
                <p>
                  When you browse our Site, we automatically gather data such as your device's operating system, IP address, visit duration, browser type, language settings, and referring website. We track purchase and content usage history, and may aggregate usage with other users for features such as "Best Seller" and "Top Rated". We also collect clickstream URLs (before, during, and after your visit), cookie identifiers, pages viewed, page load times, errors, visit duration, and interaction data (scrolls, clicks, mouse-overs).
                </p>
                <p>
                  Cookies are used to collect data automatically to enhance the Website, marketing efforts, and user experience. You may configure your browser to reject or delete cookies, but some site features may become unavailable. By using our Website, you consent to Us showcasing your feedback for promotional purposes on our Website and marketing materials. We retain data as long as necessary to fulfill the services requested or as required by law.
                </p>
              </section>

              <hr className="my-6" />

              <section id="how-use">
                <h3>How we use information</h3>
                <p>We use collected data to support, maintain, and enhance our offerings, including to:</p>
                <ul>
                  <li>Improve our services, Website, and business operations;</li>
                  <li>Understand and enhance your overall experience;</li>
                  <li>Customize offerings and suggest products or services;</li>
                  <li>Deliver products and services you request;</li>
                  <li>Process and complete transactions;</li>
                  <li>Offer customer service and respond to queries;</li>
                  <li>Manage your online accounts;</li>
                  <li>Send updates, confirmations, invoices, alerts, and support notices;</li>
                  <li>Communicate promotions, events, and offerings;</li>
                  <li>Process data without prior consent when required by law (e.g., identity verification, fraud prevention);</li>
                  <li>Investigate and deter fraud, misuse, or illegal conduct.</li>
                </ul>
              </section>

              <hr className="my-6" />

              <section id="data-transfer">
                <h3>Data transfer</h3>
                <p>
                  We may share your information with your permission or as required to complete transactions or provide services. We work with affiliates, partners, and service providers (e.g., delivery, order/payment processors, email, customer support). These vendors have access only to the data necessary to perform their tasks and are contractually bound to use it only for those purposes. We may disclose personal data to comply with legal obligations or to protect rights and safety, including sharing with fraud-prevention or credit agencies.
                </p>
              </section>

              <hr className="my-6" />

              <section id="cookies">
                <h3>Cookies</h3>
                <p>
                  We use cookies to improve functionality, remember preferences, and analyze site usage. Some cookies persist between visits; others expire at session end. Third parties (analytics, search engines, social platforms, advertisers) may set cookies when you interact with our services to deliver targeted ads, assess ad performance, and support content delivery. You can disable cookies in your browser, but this may reduce site functionality.
                </p>
              </section>

              <hr className="my-6" />

              <section id="data-security">
                <h3>Data security</h3>
                <p>
                  We take measures to protect personal data against unauthorized access, loss, or misuse. Staff are trained on secure handling of data. Sensitive inputs (passwords, payment details) are protected with SSL encryption during transmission. We adhere to PCI DSS standards for payment card data handling and use physical, electronic, and procedural safeguards. You are responsible for maintaining confidentiality of your login credentials and should sign out from shared devices. Data is stored on secure servers with limited access and retained only as necessary for transactions or as required by law.
                </p>
              </section>

              <hr className="my-6" />

              <section id="third-party">
                <h3>Links to third party site/apps</h3>
                <p>Our Website may link to external sites that have their own privacy policies. We are not responsible for their practices. Review their policies when visiting these sites.</p>
              </section>

              <hr className="my-6" />

              <section id="social-plugins">
                <h3>Social network plugins</h3>
                <p>We include social sharing buttons and plugins that do not activate cookies unless you interact with them. If you engage, data collection will be governed by the social network's privacy policy.</p>
              </section>

              <hr className="my-6" />

              <section id="sharing">
                <h3>Sharing of personal information</h3>
                <p>We do not share personal data without your consent except in these circumstances: with third parties working on our behalf (under contractual obligations), to comply with legal requests, to protect rights/property/customers/the public, in emergencies, or as part of business transactions (merger, sale, acquisition).</p>
              </section>

              <hr className="my-6" />

              <section id="children">
                <h3>Children</h3>
                <p>If you are under 18 (or legal age in your jurisdiction), you may use the Website only with parental or guardian permission. We are not responsible for misuse arising from non-compliance with this clause.</p>
              </section>

              <hr className="my-6" />

              <section id="changes">
                <h3>Changes to this policy</h3>
                <p>We may update this policy at any time; the "Last Updated" date at the top will reflect changes. Continued use of our services indicates acceptance of the updated policy.</p>
              </section>

              <hr className="my-6" />

              <section id="newsletter">
                <h3>Newsletter</h3>
                <p>When you subscribe, your email may be used for promotional messaging until you opt out. You may unsubscribe anytime via the link in our emails.</p>
              </section>

              <hr className="my-6" />

              <section id="contact">
                <h3>Contact details</h3>
                <p>
                  Aachiammafoods<br />
                  Mankavu<br />
                  Palakkad, Kerala — 678001<br />
                  Email: <a href="mailto:info@aachiammafoods.com" className="underline">info@aachiammafoods.com</a>
                </p>
              </section>

              <div className="mt-6 text-sm text-gray-500">Effective date: June 15th, 2025 • Last updated: June 15th, 2025</div>
            </article>

            <div className="text-center text-sm text-gray-600">Questions about this policy? Reach out at <a href="mailto:info@aachiammafoods.com" className="underline">info@aachiammafoods.com</a>.</div>
          </main>
        </div>
      </div>
    </section>
  );
}
