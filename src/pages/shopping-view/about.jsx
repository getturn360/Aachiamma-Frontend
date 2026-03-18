import React from "react";
import { motion } from "framer-motion";
import heroImageDefault from "@/assets/feature-hero.jpg";


export default function AboutInner({ heroImage = heroImageDefault, onContact }) {
    const accent = "#08665F";

    const products = [
        { title: "Fresh Spice Powders", subtitle: "Stone-ground daily — no preservatives", img: "/assets/powder-fresh.jpg" },
        { title: "Homestyle Pickles", subtitle: "Made with fresh produce, naturally fermented", img: "/assets/pickle-fresh.jpg" },
        { title: "Crisp Snacks", subtitle: "Prepared same-day — light oil, natural flavours", img: "/assets/snack-fresh.jpg" },
    ];

    return (
        <section className="w-full bg-white text-gray-900 py-24 px-8 md:px-16 lg:px-28" aria-label="About Aachi Amma Foods">
            <div className="max-w-5xl mx-auto">
            
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="flex items-center gap-4">
                            <span className="px-4 py-1 rounded-full text-sm font-semibold tracking-wide" style={{ backgroundColor: 'rgba(8,102,95,0.06)', color: accent }}>
                                Fresh • Homemade
                            </span>
                            <div className="text-sm text-gray-400">Made daily • No chemicals • Pure ingredients</div>
                        </div>

                        <h1 className="mt-8 text-4xl md:text-5xl font-extrabold leading-snug tracking-tight">
                            Aachiamma Foods
                            <br />
                            <span className="block mt-3 text-3xl md:text-4xl" style={{ color: accent }}>
                                Pure. Homemade. Fresh every day.
                            </span>
                        </h1>

                        <p className="mt-8 text-gray-600 max-w-3xl text-lg leading-relaxed">
                            We prepare small-batch, home-style foods using only handpicked, natural ingredients. No
                            preservatives. No artificial colours or flavours. Each jar is prepared and packed fresh — made in
                            our Agraharam kitchen with care and simple, traditional methods.
                        </p>

                        <div className="mt-10 text-sm text-gray-500 max-w-xl space-y-3">
                            <p>
                                <strong className="font-semibold">Honest cooking:</strong> Our methods are simple and time-honoured —
                                nothing artificial is added. We believe good food begins with clean ingredients and careful hands.
                            </p>

                            <p>
                                <strong className="font-semibold">Daily freshness:</strong> Small batches prepared and packed on the
                                same day for bright, natural flavour. Best consumed fresh.
                            </p>
                        </div>
                    </div>

                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.12 }} className="w-full max-w-lg mx-auto relative">
                        <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-50">
                            <img src={heroImage} alt="Freshly prepared jars" className="w-full h-[420px] object-cover" />
                            <div className="absolute -bottom-8 left-8 bg-white/75 backdrop-blur-md rounded-xl px-5 py-3 border" style={{ borderColor: 'rgba(8,102,95,0.06)' }}>
                                <div className="text-sm text-gray-700 font-semibold">Prepared fresh — same day packing</div>
                                <div className="text-xs text-gray-500 mt-0.5">No preservatives • No artificial flavours</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>


                <section id="how-we-make" className="mt-24">
                    <motion.h3 initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-2xl font-bold">
                        How we make
                    </motion.h3>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Handpicked ingredients', desc: 'Fresh produce and spices selected daily from trusted local sources.' },
                            { title: 'Clean home kitchen', desc: 'Prepared in a hygienic Agraharam kitchen following careful practices.' },
                            { title: 'Same-day packing', desc: 'Packed on the day of preparation to preserve natural taste.' },
                        ].map((s, idx) => (
                            <motion.div key={s.title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: idx * 0.06 }} className="rounded-xl border p-8 bg-white shadow-sm">
                                <div className="font-semibold text-lg" style={{ color: accent }}>{s.title}</div>
                                <div className="text-sm text-gray-500 mt-3 leading-relaxed">{s.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="mt-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div>
                        <motion.h4 initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-2xl font-bold">Our promise</motion.h4>
                        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-6 text-gray-600 max-w-xl text-lg leading-relaxed">We never use artificial preservatives, colours or chemicals. Our methods are traditional — honest, simple and focused on taste. If you prefer natural flavour and freshly prepared items, our jars are made for you.</motion.p>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ background: accent }}>✓</div>
                                <div>
                                    <div className="font-semibold">No preservatives</div>
                                    <div className="text-sm text-gray-500">Pure ingredients, consumed fresh.</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ background: accent }}>🌿</div>
                                <div>
                                    <div className="font-semibold">Simple ingredients</div>
                                    <div className="text-sm text-gray-500">Only what belongs in the kitchen.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <motion.aside initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="rounded-3xl border p-10 bg-white shadow-2xl flex flex-col justify-between">
                        <div>
                            <div className="text-sm text-gray-400">Get in touch</div>
                            <div className="text-2xl font-bold mt-2">Questions & enquiries</div>
                            <p className="mt-4 text-gray-500 text-sm leading-relaxed">If you have any questions or need any information, please use the contact button below to reach us.</p>
                        </div>

                        <div className="w-full md:w-auto mt-[20px]">
                            <button onClick={() => (onContact ? onContact() : window.location.href = 'contact')} className="px-6 py-3 rounded-full font-semibold shadow" style={{ background: accent, color: 'white' }}>Contact us</button>
                        </div>
                    </motion.aside>
                </section>

                <div className="mt-20 text-center text-sm text-gray-500">Made with care in our Agraharam kitchen • No preservatives • Consume fresh for best taste</div>
            </div>
        </section>
    );
}
