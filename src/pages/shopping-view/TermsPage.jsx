import React from 'react';
import { motion } from 'framer-motion';


export default function TermsPage({ accent = '#08665F' }) {
  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'online-store-terms', title: 'Section 1 — Online Store Terms' },
    { id: 'general-conditions', title: 'Section 2 — General Conditions' },
    { id: 'accuracy', title: 'Section 3 — Accuracy, Completeness & Timeliness' },
    { id: 'modifications-prices', title: 'Section 4 — Modifications & Prices' },
    { id: 'products', title: 'Section 5 — Products or Services' },
    { id: 'billing', title: 'Section 6 — Accuracy of Billing & Account Info' },
    { id: 'optional-tools', title: 'Section 7 — Optional Tools' },
    { id: 'third-party-links', title: 'Section 8 — Third-Party Links' },
    { id: 'submissions', title: 'Section 9 — User Comments & Submissions' },
    { id: 'personal-info', title: 'Section 10 — Personal Information' },
    { id: 'errors', title: 'Section 11 — Errors, Inaccuracies & Omissions' },
    { id: 'prohibited-uses', title: 'Section 12 — Prohibited Uses' },
    { id: 'disclaimer', title: 'Section 13 — Disclaimer & Limitation of Liability' },
    { id: 'indemnification', title: 'Section 14 — Indemnification' },
    { id: 'severability', title: 'Section 15 — Severability' },
    { id: 'termination', title: 'Section 16 — Termination' },
    { id: 'entire-agreement', title: 'Section 17 — Entire Agreement' },
    { id: 'governing-law', title: 'Section 18 — Governing Law' },
    { id: 'changes', title: 'Section 19 — Changes to Terms' },
    { id: 'contact', title: 'Section 20 — Contact Information' }
  ];

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className="w-full bg-white text-gray-900 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-3">
              <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: 'rgba(8,102,95,0.06)', color: accent }}>
                Legal
              </span>
            </div>

            <h1 className="mt-6 text-3xl md:text-4xl font-extrabold leading-tight">Terms of Service</h1>
            <p className="mt-4 text-gray-600 text-base max-w-3xl mx-auto leading-relaxed">Please read these terms carefully. They affect your rights and obligations when you use Aachiamma Foods' website and services.</p>

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
                  <button key={s.id} onClick={() => scrollToId(s.id)} className="text-left hover:text-[' + accent + '] focus:outline-none">
                    <div className="text-gray-700">{s.title}</div>
                  </button>
                ))}
              </nav>

              <div className="mt-6 text-xs text-gray-400">Last updated: <span className="font-medium text-gray-600">{new Date().toLocaleDateString()}</span></div>
            </div>
          </aside>

          <main className="md:col-span-3 space-y-8">
            <article className="rounded-2xl border p-8 bg-white shadow-lg">
              <section id="overview" className="prose prose-sm max-w-none">
                <h2>Overview</h2>
                <p>
                  This website is operated by <strong>Aachiamma Foods</strong>. Throughout the site, the terms “we”, “us”, and “our” refer to Aachiamma Foods. Aachiamma Foods provides this website, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
                </p>
                <p>
                  By visiting our website and/or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including any additional terms, conditions, and policies referenced herein or accessible by hyperlink.
                </p>
              </section>

              <hr className="my-6" />

              <section id="online-store-terms" className="prose prose-sm max-w-none">
                <h3>SECTION 1 – ONLINE STORE TERMS</h3>
                <p>
                  By agreeing to these Terms of Service, you confirm that you are at least the age of majority in your state or province of residence, or that you are the age of majority and have provided us your consent to allow any of your minor dependents to use this website.
                </p>
                <ul>
                  <li>You agree not to use our products for any unauthorized or unlawful purpose, nor to violate any laws in your jurisdiction (including but not limited to copyright laws) while using our services.</li>
                  <li>You must not transmit any viruses, malware, or any harmful code.</li>
                  <li>A breach or violation of any of these Terms may result in immediate termination of your access to our Services.</li>
                </ul>
              </section>

              <hr className="my-6" />

              <section id="general-conditions" className="prose prose-sm max-w-none">
                <h3>SECTION 2 – GENERAL CONDITIONS</h3>
                <p>We reserve the right to deny service to anyone for any reason at any time.</p>
                <p>You understand that your content (excluding credit card data) may be transferred unencrypted and may involve (a) transmissions over different networks, and (b) modifications to conform and adapt to the technical requirements of various networks or devices. Credit card information is always encrypted during transfer over networks.</p>
                <p>You agree not to reproduce, duplicate, copy, sell, resell, or exploit any part of the Service, use of the Service, or access to the Service without our express written permission.</p>
              </section>

              <hr className="my-6" />

              <section id="accuracy" className="prose prose-sm max-w-none">
                <h3>SECTION 3 – ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION</h3>
                <p>We are not responsible if the information provided on this site is inaccurate, incomplete, or not up to date. The material is provided for general information only and should not be relied upon solely for making decisions. You should consult more accurate, complete, or timely sources of information. Any reliance on the material here is at your own risk.</p>
              </section>

              <hr className="my-6" />

              <section id="modifications-prices" className="prose prose-sm max-w-none">
                <h3>SECTION 4 – MODIFICATIONS TO THE SERVICE AND PRICES</h3>
                <p>Prices of our products are subject to change without notice. We reserve the right to modify or discontinue the Service (or any part of it) at any time without notice. We shall not be liable to you or to any third party for any modification, price change, suspension, or discontinuation of the Service.</p>
              </section>

              <hr className="my-6" />

              <section id="products" className="prose prose-sm max-w-none">
                <h3>SECTION 5 – PRODUCTS OR SERVICES (if applicable)</h3>
                <p>Some products or services may be available exclusively online through our website. These items may have limited quantities and can only be returned or exchanged in accordance with our Return Policy.</p>
                <p>We have made every effort to display product colours and images as accurately as possible. However, we cannot guarantee your monitor’s display will reflect the actual product colour.</p>
              </section>

              <hr className="my-6" />

              <section id="billing" className="prose prose-sm max-w-none">
                <h3>SECTION 6 – ACCURACY OF BILLING AND ACCOUNT INFORMATION</h3>
                <p>We reserve the right to reject any order placed with us. At our discretion, we may limit or cancel quantities purchased per person, household, or order. These limitations may apply to orders placed using the same customer account, credit card, and/or billing and shipping address.</p>
              </section>

              <hr className="my-6" />

              <section id="optional-tools" className="prose prose-sm max-w-none">
                <h3>SECTION 7 – OPTIONAL TOOLS</h3>
                <p>We may give you access to third-party tools that we do not monitor, control, or influence. You acknowledge and agree that we provide such tools “as is” and “as available,” without any warranties, representations, or endorsements.</p>
              </section>

              <hr className="my-6" />

              <section id="third-party-links" className="prose prose-sm max-w-none">
                <h3>SECTION 8 – THIRD-PARTY LINKS</h3>
                <p>Some content, products, and services available via our Service may include materials from third parties. Links to third-party websites on our site may direct you to websites not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and do not warrant or assume any liability for third-party materials, websites, or services.</p>
                <p>By submitting our webform, you agree to receive promotional calls on the number shared. These calls and SMS messages may be sent via third-party platforms.</p>
              </section>

              <hr className="my-6" />

              <section id="submissions" className="prose prose-sm max-w-none">
                <h3>SECTION 9 – USER COMMENTS, FEEDBACK AND OTHER SUBMISSIONS</h3>
                <p>If you send certain submissions (e.g., contest entries) at our request, or send ideas, suggestions, or other materials without our request (collectively, ‘comments’), you agree that we may edit, copy, publish, distribute, and use them in any medium at any time without restriction.</p>
              </section>

              <hr className="my-6" />

              <section id="personal-info" className="prose prose-sm max-w-none">
                <h3>SECTION 10 – PERSONAL INFORMATION</h3>
                <p>Your submission of personal information through the store is governed by our Privacy Policy. Please refer to our Privacy Policy for more information.</p>
              </section>

              <hr className="my-6" />

              <section id="errors" className="prose prose-sm max-w-none">
                <h3>SECTION 11 – ERRORS, INACCURACIES AND OMISSIONS</h3>
                <p>Occasionally, information on our site or Service may contain typographical errors, inaccuracies, or omissions related to product descriptions, pricing, promotions, shipping costs, or availability. We reserve the right to correct such errors and update information or cancel orders if any part of the Service or related website is inaccurate, at any time, without prior notice (even after you’ve placed an order).</p>
              </section>

              <hr className="my-6" />

              <section id="prohibited-uses" className="prose prose-sm max-w-none">
                <h3>SECTION 12 – PROHIBITED USES</h3>
                <p>In addition to other prohibitions stated in these Terms, you are prohibited from using the site or its content for illegal purposes, to solicit others to perform unlawful acts, to break any laws or regulations, to violate intellectual property rights, to harass, harm, or discriminate against others, to submit false information, to spread malicious software, to collect personal data of others, to spam or engage in deceptive practices, for obscene purposes, or to interfere with the Service’s security.</p>
              </section>

              <hr className="my-6" />

              <section id="disclaimer" className="prose prose-sm max-w-none">
                <h3>SECTION 13 – DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY</h3>
                <p>We do not guarantee that your use of our Service will be uninterrupted, secure, or error-free. You expressly agree your use of the Service is at your sole risk. All products and services provided are “as is” and “as available” without any warranties, express or implied.</p>
              </section>

              <hr className="my-6" />

              <section id="indemnification" className="prose prose-sm max-w-none">
                <h3>SECTION 14 – INDEMNIFICATION</h3>
                <p>You agree to indemnify and hold harmless Aachiamma Foods, and its affiliates, employees, partners, and service providers, from any claim or demand, including legal fees, made by any third party due to your violation of these Terms or applicable laws, or infringement of third-party rights.</p>
              </section>

              <hr className="my-6" />

              <section id="severability" className="prose prose-sm max-w-none">
                <h3>SECTION 15 – SEVERABILITY</h3>
                <p>If any provision of these Terms is deemed unlawful, void, or unenforceable, the rest of the Terms shall remain valid and enforceable to the maximum extent allowed by law.</p>
              </section>

              <hr className="my-6" />

              <section id="termination" className="prose prose-sm max-w-none">
                <h3>SECTION 16 – TERMINATION</h3>
                <p>Any obligations incurred before termination will survive after termination. These Terms remain in effect unless terminated by either you or us. You may terminate them at any time by discontinuing use of the site or notifying us.</p>
              </section>

              <hr className="my-6" />

              <section id="entire-agreement" className="prose prose-sm max-w-none">
                <h3>SECTION 17 – ENTIRE AGREEMENT</h3>
                <p>These Terms, along with any policies posted on this site, form the entire agreement between you and Aachiamma Foods, superseding any prior communications or agreements. Any ambiguities will not be interpreted against the party that drafted them.</p>
              </section>

              <hr className="my-6" />

              <section id="governing-law" className="prose prose-sm max-w-none">
                <h3>SECTION 18 – GOVERNING LAW</h3>
                <p>These Terms and any agreements for services shall be governed by the laws of India.</p>
              </section>

              <hr className="my-6" />

              <section id="changes" className="prose prose-sm max-w-none">
                <h3>SECTION 19 – CHANGES TO TERMS OF SERVICE</h3>
                <p>You can review the most current version of the Terms on this page. We may update or change these Terms at our sole discretion. Your continued use of the website following such changes constitutes your acceptance of them.</p>
              </section>

              <hr className="my-6" />

              <section id="contact" className="prose prose-sm max-w-none">
                <h3>SECTION 20 – CONTACT INFORMATION</h3>
                <p>Questions about the Terms of Service should be directed to: <a href="mailto:info@aachiammafoods.in" className="underline">info@aachiammafoods.in</a></p>
              </section>

              <div className="mt-8 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
            </article>

            <div className="text-center text-sm text-gray-600">By using this site you agree to these Terms of Service. For any legal concerns, please contact us at the address above.</div>

          </main>
        </div>
      </div>
    </section>
  );
}