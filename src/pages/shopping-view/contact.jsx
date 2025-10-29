import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/api/axios";
import { toast } from "@/lib/toast";

export default function ContactPage({ accent = "#08665F" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [settings, setSettings] = useState({
    address: "Mankavu, Palakkad, Kerala – 678001",
    phone: "+91 7356 428 330",
    email: "info@aachiammafoods.com",
  });

  // success alert state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successText, setSuccessText] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("api/common/site-settings/get");
        if (mounted && res && res.data && res.data.success) {
          setSettings((prev) => ({ ...prev, ...(res.data.data || {}) }));
        }
      } catch (err) {
        // ignore, keep defaults
      }
    })();
    return () => (mounted = false);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 4500);
    return () => clearTimeout(t);
  }, [showSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill name, email and message");
      return;
    }
    try {
      setSending(true);
      const res = await api.post("api/shop/contact/add", { name, email, phone, message });
      if (res && res.data && res.data.success) {
        // set and show the premium success alert
        setSuccessText((res && res.data && res.data.message) || "Your message has been received — we'll get back to you soon.");
        setShowSuccess(true);

        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        toast.error((res && res.data && res.data.message) || "Failed to send");
      }
    } catch (err) {
      toast.error("Network/server error");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="w-full bg-white text-gray-900 py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{ background: "rgba(8,102,95,0.06)", color: accent }}
              >
                Get in Touch
              </span>
            </div>

            <h1 className="mt-6 text-3xl md:text-4xl font-extrabold leading-tight">Get in Touch</h1>

            <p className="mt-4 text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
              We’d love to hear from you! Whether you have a question, need assistance, or want to collaborate, feel
              free to reach out. Our team is always ready to help. Or simply fill out the contact form, and we’ll get
              back to you as soon as possible!
            </p>

            <div className="mt-6 text-gray-700 max-w-md mx-auto text-sm">
              <div className="font-semibold">Customer Service Hours:</div>
              <div className="mt-1">Monday-Friday: 9.00 AM – 6.00 PM</div>
              <div>Saturday: 10.00 AM – 2.00 PM</div>
            </div>
          </div>
        </motion.header>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Contact form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border p-8 bg-white shadow-lg"
          >
            <div className="text-sm text-gray-500">Quick enquiry</div>
            <h2 className="mt-2 text-xl font-semibold">Send us a message</h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="mt-2 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Phone (optional)</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2"
                  placeholder="+91 9XXXXXXXXX"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2"
                  placeholder="Ask about ingredients, packing dates, shelf life or order details..."
                ></textarea>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={sending}
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow"
                style={{ background: accent, color: "white" }}
              >
                {sending ? "Sending..." : "Contact us"}
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              We respect your privacy. Your details are used only to respond to your enquiry.
            </div>
          </motion.form>

          {/* Contact details card */}
          <motion.aside
            initial={{ opacity: 0, x: 8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border p-8 bg-white shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="text-sm text-gray-400">Reach Us</div>
              <h3 className="mt-2 text-xl font-semibold">Contact details</h3>

              <div className="mt-6 space-y-5 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={accent}
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0 mt-0.5"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-400">Address</div>
                    <div className="font-medium whitespace-pre-line">{settings.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={accent}
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0 mt-0.5"
                  >
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 01.93-.27c1.02.24 2.12.37 3.26.37a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.14.13 2.24.37 3.26a1 1 0 01-.27.93l-2.98 2.6z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-400">Phone</div>
                    <div className="font-medium">
                      <a href={`tel:${settings.phone}`}>{settings.phone}</a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={accent}
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-400">Email</div>
                    <div className="font-medium">
                      <a className="underline" href={`mailto:${settings.email}`}>
                        {settings.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs text-gray-500">Note</div>
              <div className="text-sm text-gray-600 mt-1">
                We do not include a map on this page. For pickup or special delivery instructions, please contact us
                using the details above.
              </div>
            </div>
          </motion.aside>
        </div>

        <div className="mt-14 text-center text-sm text-gray-500">
          Made fresh in our Agraharam kitchen • No preservatives • Ask us anything about ingredients or preparation
        </div>
      </div>

      {/* Premium success alert (centered, dark backdrop) */}
      <AnimatePresence>
        {showSuccess && (
          <>
            {/* dark backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.55)" }}
              aria-hidden
            />

            {/* centered card */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
            >
              <div className="max-w-lg w-full">
                <div
                  className="rounded-2xl p-6 shadow-2xl backdrop-blur-md border border-gray-100"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(249,250,251,0.9))" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 rounded-full p-2"
                      style={{ background: `${accent}22`, color: accent }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold" style={{ color: "#0f172a" }}>
                            Message sent
                          </div>
                          <div className="text-xs mt-1" style={{ color: "#475569" }}>
                            {successText}
                          </div>
                        </div>

                        <button
                          onClick={() => setShowSuccess(false)}
                          aria-label="Close"
                          className="ml-2 rounded-full p-1.5 hover:bg-gray-100"
                          style={{ color: "#475569" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-3 text-right">
                        <button
                          onClick={() => setShowSuccess(false)}
                          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
                          style={{ background: `${accent}`, color: "white" }}
                        >
                          Okay
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
