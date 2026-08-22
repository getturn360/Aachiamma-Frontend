import React from "react";
import { motion } from "framer-motion";
import heroImageDefault from "@/assets/feature-hero.jpg";
import SEO from "@/components/common/SEO";
import AboutFaqSection from "@/components/shopping-view/about/AboutFaqSection";
import { Leaf, ChefHat, Sparkles, ShieldCheck, Heart, Clock } from "lucide-react";


export default function AboutInner({ heroImage = heroImageDefault, onContact }) {
    const accent = "#08665F";

    const products = [
        { title: "Fresh Spice Powders", subtitle: "Stone-ground daily — no preservatives", img: "/assets/powder-fresh.jpg" },
        { title: "Homestyle Pickles", subtitle: "Made with fresh produce, naturally fermented", img: "/assets/pickle-fresh.jpg" },
        { title: "Crisp Snacks", subtitle: "Prepared same-day — light oil, natural flavours", img: "/assets/snack-fresh.jpg" },
    ];

    const steps = [
        {
            title: 'Handpicked Ingredients',
            desc: 'Freshly collected ingredients from native farmers.',
            icon: Leaf,

            accentBg: 'bg-emerald-50/80',
            accentText: 'text-emerald-700',
            gradient: 'from-emerald-500/10 to-teal-500/10',
            borderColor: 'hover:border-emerald-200/60 hover:shadow-emerald-950/[0.02]'
        },
        {
            title: 'Clean Home Kitchen',
            desc: 'Kerala homemade snacks & pickles prepared and packed in the Agraharam kitchen.',
            icon: ChefHat,

            accentBg: 'bg-amber-50/80',
            accentText: 'text-amber-700',
            gradient: 'from-amber-500/10 to-orange-500/10',
            borderColor: 'hover:border-amber-200/60 hover:shadow-amber-950/[0.02]'
        },
        {
            title: 'Same-day Packing',
            desc: 'We pack on the same day to sustain the freshness and uniqueness of the taste.',
            icon: Sparkles,

            accentBg: 'bg-teal-50/80',
            accentText: 'text-teal-700',
            gradient: 'from-teal-500/10 to-cyan-500/10',
            borderColor: 'hover:border-teal-200/60 hover:shadow-teal-950/[0.02]'
        },
    ];

    return (
        <>
            <SEO
                title="Authentic Kerala Agraharam Recipes | About aachiammafoods"
                description="Discover aachiammafoods and our authentic Kerala Agraharam recipes, traditional pickles, homemade snacks and preservative-free South Indian flavors."
                keywords={[
                    "Kerala Agraharam recipes",
                    "homemade Kerala snacks",
                    "traditional Kerala pickles",
                    "South Indian snacks",
                    "Kerala homemade foods",
                    "aachiammafoods",
                ]}
                author="aachiammafoods"
                robots="index, follow"
                canonical="https://aachiammafoods.com/about"
                ogTitle="Authentic Kerala Agraharam Recipes | About aachiammafoods"
                ogDescription="Discover aachiammafoods and our authentic Kerala Agraharam recipes, traditional pickles, homemade snacks and preservative-free South Indian flavors."
                ogUrl="https://aachiammafoods.com/about"
                ogSiteName="aachiammafoods"
                ogImage="https://aachiammafoods.com/wp-content/uploads/2025/07/LOGO-FINAL.png"
                ogLocale="en_IN"
                ogType="website"
                twitterCard="summary_large_image"
                twitterTitle="Authentic Kerala Agraharam Recipes | About aachiammafoods"
                twitterDescription="Discover aachiammafoods and our authentic Kerala Agraharam recipes, traditional pickles, homemade snacks and preservative-free South Indian flavors."
                twitterImage="https://aachiammafoods.com/wp-content/uploads/2025/07/LOGO-FINAL.png"
                twitterCreator="@aachiammafoods"
            />

            <section className="w-full bg-white text-gray-900 py-24 px-8 md:px-16 lg:px-28" aria-label="About Aachi Amma Foods">
                <div className="max-w-5xl mx-auto">

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>


                            <h1 className="mt-8 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-950">
                            Authentic Kerala Agraharam Homemade Food
                            </h1>

                            <div
                                className="mt-6 p-5 md:py-6 md:px-8 inline-flex flex-col items-start gap-1 rounded-2xl border"
                                style={{
                                    backgroundColor: 'rgba(8,102,95,0.04)',
                                    borderColor: 'rgba(8,102,95,0.15)'
                                }}
                            >
                                <span className="block text-2xl md:text-3xl font-black tracking-tight" style={{ color: accent }}>
                                The Pure Taste of Kerala
                                </span>
                                <span className="block text-lg md:text-xl font-semibold text-emerald-800/80 mt-1">
                                Agraharam Food

                                </span>
                            </div>

                            <p className="mt-8 text-gray-600 max-w-3xl text-lg leading-relaxed">
                            Cooked in a Traditional Agraharam Kitchen
                             We cook traditional Palakkad Agraharam food using authentic recipes. We never cook large amounts of food together to preserve the uniqueness of the products. No preservatives or artificial colours are used, and foods are packed on the same day of cooking.

                            </p>

                            <div className="mt-10 space-y-4 max-w-xl">
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-transparent border border-emerald-100/30"
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-700 bg-emerald-100/50 shrink-0 mt-0.5">
                                        <Heart className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm tracking-tight"> Secret Behind the Taste
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                        Palakkad Agraharam food recipes and freshly collected ingredients ensure the unique Kerala taste.
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -2 }}
                                    className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-teal-50/60 to-transparent border border-teal-100/30"
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-teal-700 bg-teal-100/50 shrink-0 mt-0.5">
                                        <Clock className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm tracking-tight">Fresh and Authentic</h4>
                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                        Only a small batch of products is cooked and packed at a time to preserve the taste of Kerala homemade snacks & pickles.
                                        </p>
                                    </div>
                                </motion.div>
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


                    <section
                        id="how-we-make"
                        className="mt-28 p-8 md:py-16 md:px-12 rounded-[32px] shadow-xl relative overflow-hidden"
                        style={{ backgroundColor: accent }}
                    >
                        {/* Decorative subtle texture/gradient overlay inside section */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-center max-w-2xl mx-auto mb-12 relative z-10"
                        >
                            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                                How We Make
                            </h3>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                            {steps.map((s, idx) => {
                                const IconComponent = s.icon;
                                return (
                                    <motion.div
                                        key={s.title}
                                        initial={{ opacity: 0, y: 15 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-emerald-100/10 flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Icon Container */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${s.gradient} ${s.accentText} shadow-inner mb-5`}>
                                                <IconComponent className="w-5.5 h-5.5 stroke-[2]" />
                                            </div>

                                            <h4 className="font-bold text-lg text-gray-900 tracking-tight">
                                                {s.title}
                                            </h4>

                                            <p className="text-sm text-gray-600 font-medium mt-3 leading-relaxed">
                                                {s.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>


                    <section className="mt-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div>
                            <motion.h4 initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-2xl font-bold">Our Promise</motion.h4>
                            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mt-6 text-gray-600 max-w-xl text-lg leading-relaxed">As a homemade Kerala food brand, we make our customers' health our first priority. That's why we don't use artificial flavours or chemical preservatives, and we follow proven traditional methods of Agraharam cooking to ensure the authentic taste.
                            </motion.p>

                            <div className="mt-8 space-y-4">
                                <motion.div
                                    whileHover={{ x: 6, transition: { duration: 0.2 } }}
                                    className="group flex items-center gap-5 p-4 rounded-2xl border border-gray-100 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-emerald-100/80 transition-all duration-300"
                                >
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105"
                                        style={{ background: `linear-gradient(135deg, ${accent} 0%, #0c8b82 100%)` }}
                                    >
                                        <ShieldCheck className="w-6 h-6 stroke-[2]" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-lg text-gray-900 group-hover:text-emerald-950 transition-colors duration-200">No Preservatives</h5>
                                        <p className="text-sm text-gray-500 mt-1">Pure ingredients, consumed fresh.</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ x: 6, transition: { duration: 0.2 } }}
                                    className="group flex items-center gap-5 p-4 rounded-2xl border border-gray-100 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-emerald-100/80 transition-all duration-300"
                                >
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105"
                                        style={{ background: `linear-gradient(135deg, ${accent} 0%, #0c8b82 100%)` }}
                                    >
                                        <Leaf className="w-6 h-6 stroke-[2]" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-lg text-gray-900 group-hover:text-emerald-950 transition-colors duration-200">Simple Ingredients</h5>
                                        <p className="text-sm text-gray-500 mt-1">Only what belongs in the kitchen.</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <motion.aside initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="rounded-3xl border p-10 bg-white shadow-2xl flex flex-col justify-between">
                            <div>
                                <div className="text-sm text-gray-400">Get in touch</div>
                                <div className="text-2xl font-bold mt-2">Questions & Enquiries</div>
                                <p className="mt-4 text-gray-500 text-sm leading-relaxed">If you have any questions or need any information, please use the contact button below to reach us.</p>
                            </div>

                            <div className="w-full md:w-auto mt-[20px]">
                                <button onClick={() => (onContact ? onContact() : window.location.href = 'contact')} className="px-6 py-3 rounded-full font-semibold shadow" style={{ background: accent, color: 'white' }}>Contact us</button>
                            </div>
                        </motion.aside>
                    </section>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mt-24 max-w-4xl mx-auto p-4 rounded-3xl border border-emerald-100/20 bg-emerald-50/10 backdrop-blur-sm grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                        <div className="border border-emerald-100 rounded-2xl py-3.5 px-6 text-center text-[11px] font-bold tracking-wider uppercase text-emerald-900 bg-emerald-50/80 hover:bg-emerald-50 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                        Taste and purity from Agraharam Kitchen

                        </div>
                        <div className="border border-emerald-100 rounded-2xl py-3.5 px-6 text-center text-[11px] font-bold tracking-wider uppercase text-emerald-900 bg-emerald-50/80 hover:bg-emerald-50 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                        No preservatives and chemical flavours
                        </div>
                        <div className="border border-emerald-100 rounded-2xl py-3.5 px-6 text-center text-[11px] font-bold tracking-wider uppercase text-emerald-900 bg-emerald-50/80 hover:bg-emerald-50 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                        Freshly prepared and packed
                        </div>
                    </motion.div>
                </div>
            </section>

            <AboutFaqSection />
        </>
    );
}
