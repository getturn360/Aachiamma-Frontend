import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQ_ITEMS } from '@/data/faqs';


export default function FAQsPage({ accent = '#08665F', onContact }) {
    const faqs = FAQ_ITEMS;

    const [openIndex, setOpenIndex] = useState(null);

    function toggle(i) {
        setOpenIndex(openIndex === i ? null : i);
    }

    function handleKeyDown(e, i) {
    
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault(); 
            toggle(i);
        }
    }

    return (
        <section className="w-full bg-white text-gray-900 py-20 px-6 md:px-12 lg:px-28">
            <div className="max-w-4xl mx-auto">
                <motion.header
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-center">
                        <span
                            className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                            style={{ background: 'rgba(8,102,95,0.06)', color: accent }}
                        >
                            FAQ
                        </span>
                        <h1 className="mt-6 text-3xl md:text-4xl font-extrabold">Frequently asked questions</h1>
                        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                            Below are answers to questions we get asked often. If you don’t find what you need, use the contact button at the end to send us a message.
                        </p>
                    </div>
                </motion.header>

                <div className="mt-12 space-y-4">
                    {faqs.map((f, i) => {
                        const contentId = `faq-content-${i}`;
                        return (
                            <motion.div
                                key={f.q}
                                initial={{ opacity: 0, y: 6 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.04 }}
                                className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm"
                            >
                            
                                <div className="w-full flex items-center justify-between p-6 text-left">
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => handleKeyDown(e, i)}
                                        aria-expanded={openIndex === i}
                                        aria-controls={contentId}
                                        className="outline-none"
                                 
                                    >
                                        <div className="text-lg font-semibold" style={{ color: accent }}>
                                            {f.q}
                                        </div>
                                    </div>

                                    <div className="ml-4 flex-shrink-0">
                                        <button
                                            onClick={() => toggle(i)}
                                            aria-expanded={openIndex === i}
                                            aria-controls={contentId}
                                            className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#08665F]"
                                            style={{ color: openIndex === i ? '#08665F' : accent }}
                                            aria-label={openIndex === i ? 'Collapse answer' : 'Expand answer'}
                                        >
                                            <motion.svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                animate={{ rotate: openIndex === i ? 180 : 0 }}
                                                transition={{ duration: 0.25 }}
                                                style={{ display: 'block' }}
                                            >
                                                <path
                                                    d="M6 9l6 6 6-6"
                                                    stroke={openIndex === i ? '#08665F' : accent} 
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </motion.svg>
                                        </button>

                                    </div>
                                </div>

                                
                                <AnimatePresence initial={false}>
                                    {openIndex === i && (
                                        <motion.div
                                            key="content"
                                            id={contentId}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.32 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div className="px-6 pb-6">
                                                <div className="text-gray-600 leading-relaxed">{f.a}</div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mt-12 rounded-3xl border p-10 bg-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div>
                        <div className="text-sm text-gray-400">Still have a question?</div>
                        <div className="mt-2 text-xl font-semibold">Can’t find the answer you’re looking for?</div>
                        <p className="mt-3 text-gray-600 max-w-xl">Send us a message and we’ll respond quickly — whether it’s about ingredients, packing dates or ordering single packs.</p>
                    </div>

                    <div className="w-full md:w-auto">
                        <button
                            onClick={() => (onContact ? onContact() : (window.location.href = 'contact'))}
                            className="px-6 py-3 rounded-full font-semibold shadow"
                            style={{ background: accent, color: 'white' }}
                        >
                            Contact us
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}